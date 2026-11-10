import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import test from 'node:test'
import pg from 'pg'

test('사진, 여행, 프로필 및 관리자 API 권한', async (t) => {
  assert.ok(process.env.TEST_DATABASE_URL, '별도의 테스트 PostgreSQL을 TEST_DATABASE_URL로 지정하세요.')
  const schema = 'access_' + randomUUID().replaceAll('-', '')
  const db = new pg.Client({ connectionString: process.env.TEST_DATABASE_URL })
  await db.connect()
  await db.query('CREATE SCHEMA ' + schema)
  t.after(async () => {
    try {
      await db.query('DROP SCHEMA ' + schema + ' CASCADE')
    } finally {
      await db.end()
    }
  })
  await db.query('SET search_path TO ' + schema)
  await db.query(await readFile(new URL('../../database/schema.sql', import.meta.url), 'utf8'))

  async function listen(server) {
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    t.after(() => new Promise((resolve) => server.close(resolve)))
    return 'http://127.0.0.1:' + server.address().port
  }

  const storageCalls = []
  const storageUrl = await listen(createServer((req, res) => {
    storageCalls.push(req.method)
    req.resume()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end('{}')
  }))
  const dbUrl = new URL(process.env.TEST_DATABASE_URL)
  dbUrl.searchParams.set('options', '-c search_path=' + schema)
  process.env.DATABASE_URL = dbUrl.href
  process.env.JWT_SECRET = randomUUID()
  process.env.ADMIN_USER_IDS = ''
  process.env.SUPABASE_URL = storageUrl
  process.env.SUPABASE_SECRET_KEY = 'local-test-key'
  const { app } = await import('../src/app.js')
  const { pool } = await import('../src/config/db.js')
  t.after(() => pool.end())
  const url = await listen(createServer(app))

  async function api(method, path, { token, body, status = 200 } = {}) {
    const headers = {}
    if (token) headers.Authorization = 'Bearer ' + token
    if (body !== undefined && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(body)
    }
    const res = await fetch(url + '/api' + path, { method, headers, body })
    const data = await res.json()
    assert.equal(res.status, status, method + ' ' + path + ' ' + JSON.stringify(data.error))
    return data
  }
  function signup(name) {
    return api('POST', '/auth/signup', {
      body: { email: name + '@example.test', password: 'test-password', is_admin: true },
      status: 201,
    })
  }
  function upload(token, tripId, status = 201) {
    const form = new FormData()
    form.set('photo', new Blob(['test'], { type: 'image/jpeg' }), 'trip.jpg')
    if (tripId) form.set('tripId', String(tripId))
    return api('POST', '/photos/upload', { token, body: form, status })
  }
  const alice = await signup('alice')
  const bob = await signup('bob')
  const admin = await signup('admin')
  const a = alice.token
  const b = bob.token
  const { trip } = await api('POST', '/trips', { token: a, body: { title: '여행' }, status: 201 })
  const tripPath = '/trips/' + trip.id
  assert.deepEqual((await api('GET', tripPath + '/photos', { token: a })).photos, [])
  const { photo } = await upload(a, trip.id)
  const other = (await upload(b)).photo
  const photoPath = '/photos/' + photo.id

  await t.test('비로그인 요청은 401', async () => {
    for (const [method, path] of [
      ['GET', '/photos'], ['POST', '/photos/upload'], ['PATCH', photoPath + '/location'],
      ['PATCH', photoPath + '/favorite'], ['GET', '/trips'], ['POST', '/trips'],
      ['GET', tripPath + '/photos'], ['PATCH', tripPath + '/reorder'], ['DELETE', tripPath],
      ['GET', '/auth/profile'], ['GET', '/admin/photos'], ['DELETE', '/admin/photos/' + photo.id],
    ]) await api(method, path, { status: 401 })
  })

  await t.test('개인 목록, 위치, 즐겨찾기 및 프로필은 요청자 기준', async () => {
    const location = { latitude: 37, longitude: 127 }
    await api('PATCH', photoPath + '/location', { token: b, body: location, status: 404 })
    await api('PATCH', photoPath + '/favorite', { token: b, status: 404 })
    assert.deepEqual((await api('GET', '/photos', { token: a })).photos, [])
    await api('PATCH', photoPath + '/location', { token: a, body: location })
    assert.equal((await api('PATCH', photoPath + '/favorite', { token: a })).photo.is_favorite, true)
    assert.deepEqual((await api('GET', '/photos', { token: a })).photos.map(p => p.id), [photo.id])
    assert.deepEqual((await api('GET', '/photos', { token: b })).photos, [])
    const library = await api('GET', '/photos?includeUnlocated=true&userId=' + alice.user.id, { token: b })
    assert.deepEqual(library.photos.map(p => p.id), [other.id])
    const profile = await api('GET', '/auth/profile?userId=' + alice.user.id, { token: b })
    assert.equal(profile.user.id, bob.user.id)
    assert.equal(profile.photoCount, 1)
    assert.equal(profile.tripCount, 0)
  })

  await t.test('타인의 여행 접근 및 잘못된 일괄 재정렬 차단', async () => {
    assert.deepEqual((await api('GET', '/trips', { token: b })).trips, [])
    await api('GET', tripPath + '/photos', { token: b, status: 404 })
    await api('DELETE', tripPath, { token: b, status: 404 })
    const writes = storageCalls.length
    await upload(b, trip.id, 404)
    assert.equal(storageCalls.length, writes)
    const reorder = (token, photoIds, status) =>
      api('PATCH', tripPath + '/reorder', { token, body: { photoIds }, status })
    await reorder(b, [photo.id], 404)
    const second = (await upload(a, trip.id)).photo
    await reorder(a, [second.id, photo.id], 200)
    // Older records may already reference another user's trip.
    await db.query('UPDATE photos SET trip_id = $1 WHERE id = $2', [trip.id, other.id])
    await reorder(a, [photo.id, other.id], 404)
    await reorder(a, [photo.id, photo.id], 400)
    const rows = (await api('GET', tripPath + '/photos', { token: a })).photos
    assert.deepEqual(rows.map(p => [p.id, p.sequence_order]), [[second.id, 0], [photo.id, 1]])
    const ownTrips = (await api('GET', '/trips', { token: a })).trips
    assert.equal(Number(ownTrips[0].photo_count), 2)
    await api('DELETE', tripPath, { token: a })
    assert.equal((await api('GET', '/photos', { token: a })).photos[0].trip_id, null)
  })

  await t.test('명시적으로 지정한 관리자만 전체 목록·통계·삭제 가능', async () => {
    assert.equal(alice.user.is_admin, false)
    for (const path of ['/admin/stats', '/admin/photos', '/admin/profile']) {
      await api('GET', path, { token: a, status: 403 })
    }
    await api('DELETE', '/admin/photos/' + photo.id, { token: b, status: 403 })
    process.env.ADMIN_USER_IDS = String(admin.user.id)
    assert.equal((await api('GET', '/auth/me', { token: admin.token })).user.is_admin, true)
    assert.equal((await api('GET', '/admin/stats', { token: admin.token })).photoCount, 3)
    assert.equal((await api('GET', '/admin/photos', { token: admin.token })).photos.length, 3)
    await api('DELETE', '/admin/photos/' + photo.id, { token: admin.token })
    assert.equal(storageCalls.at(-1), 'DELETE')
    assert.deepEqual((await api('GET', '/photos', { token: a })).photos, [])
  })
})
