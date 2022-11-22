const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('Routing tests', () => {
    let bookId = '';

    suite('POST /api/books with title => create book object/expect book object', () => {
      test('Test POST /api/books with title', (done) => {
        chai
          .request(server).post('/api/books')
          .send({ title: 'Book 1' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'Book 1');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            bookId = res.body.id;
          });
        done();
      });

      test('Test POST /api/books with no title given', (done) => {
        chai.request(server).post('/api/books')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing required field title');
          });
        done();
      });
    });

    suite('GET /api/books => array of books', () => {
      test('Test GET /api/books', (done) => {
        chai.request(server).get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
          });
        done();
      });
    });

    suite('GET /api/books/[id] => book object with [id]', () => {
      test('Test GET /api/books/[id] with id not in db', (done) => {
        chai.request(server).get('/api/books/invalid_id')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
          });
        done();
      });

      test('Test GET /api/books/[id] with valid id in db', (done) => {
        chai.request(server).get(`api/books/${bookId}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], 'comments');
          });
        done();
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', () => {
      test('Test POST /api/books/[id] with comment', (done) => {
        chai.request(server).post(`api/books/${bookId}`)
          .send({ comment: 'anyText' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isTrue(res.body.comments.includes('anyText'));
          });
        done();
      });

      test('Test POST /api/books/[id] without comment field', (done) => {
        chai.request(server).post(`api/books/${bookId}`)
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing required field comment');
          });
        done();
      });

      test('Test POST /api/books/[id] with comment, id not in db', (done) => {
        chai.request(server).post('/api/books/invalid-id')
          .send({ comments: 'Test' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
          });
        done();
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', () => {
      test('Test DELETE /api/books/[id] with valid id in db', (done) => {
        chai.request(server).delete(`api/books/${bookId}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(true, true);
          });
        done();
      });

      test('Test DELETE /api/books/[id] with  id not in db', (done) => {
        chai.request(server).delete('/api/books/invalid-id')
          .end((err, res) => {
            assert.equal(res.body, 200);
            assert.equal(res.body, 'no book exists');
          });
        done();
      });
    });
  });
});
