import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import dbClient from '../utils/db';

const { expect } = chai;

chai.use(chaiHttp);

after(function (done) {
  this.timeout(10000);
  dbClient.Allusers()
    .then((Users) => {
      Users.deleteMany({ email: 'test@example.com' })
        .then(() => done())
        .catch((deleteErr) => done(deleteErr));
    }).catch((connectErr) => done(connectErr));
});

describe('aPI Endpoints', () => {
  let token;
  let fileId;

  describe('gET /status', () => {
    it('should return the status of Redis and DB connections', () => new Promise((done) => {
      chai.request(app)
        .get('/status')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('redis');
          expect(res.body).to.have.property('db');
          done();
        });
    }));
  });

  describe('gET /stats', () => {
    it('should return the number of users and files', () => new Promise((done) => {
      chai.request(app)
        .get('/stats')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('users');
          expect(res.body).to.have.property('files');
          done();
        });
    }));
  });

  describe('pOST /users', () => {
    it('should create a new user', () => new Promise((done) => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
      };
      chai.request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('email');
          done();
        });
    }));
  });

  describe('gET /connect', () => {
    it('should authenticate a user and return a token', () => new Promise((done) => {
      const credentials = Buffer.from('test@example.com:password123').toString('base64');
      chai.request(app)
        .get('/connect')
        .set('Authorization', `Basic ${credentials}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          token = res.body.token; // save token for later use
          done();
        });
    }));
  });

  describe('gET /users/me', () => {
    it('should retrieve the user based on the token', () => new Promise((done) => {
      chai.request(app)
        .get('/users/me')
        .set('X-Token', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('email');
          done();
        });
    }));
  });

  describe('gET /disconnect', () => {
    it('should sign-out the user based on the token', () => new Promise((done) => {
      chai.request(app)
        .get('/disconnect')
        .set('X-Token', token)
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    }));
  });

  describe('pOST /files', () => {
    it('should upload a new file', () => new Promise((done) => {
      const file = {
        name: 'test.txt',
        type: 'file',
        data: Buffer.from('Hello World!').toString('base64'),
      };
      chai.request(app)
        .post('/files')
        .set('X-Token', token)
        .send(file)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('id');
          fileId = res.body.id; // save fileId for later use
          done();
        });
    }));
  });

  describe('gET /files/:id', () => {
    it('should retrieve a file based on the ID', () => new Promise((done) => {
      chai.request(app)
        .get(`/files/${fileId}`)
        .set('X-Token', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('name');
          done();
        });
    }));
  });

  describe('gET /files', () => {
    it('should retrieve all user files with pagination', () => new Promise((done) => {
      chai.request(app)
        .get('/files')
        .set('X-Token', token)
        .query({ page: 0 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    }));
  });

  describe('pUT /files/:id/publish', () => {
    it('should set a file to public', () => new Promise((done) => {
      chai.request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('isPublic', true);
          done();
        });
    }));
  });

  describe('pUT /files/:id/unpublish', () => {
    it('should set a file to private', () => new Promise((done) => {
      chai.request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('isPublic', false);
          done();
        });
    }));
  });

  describe('gET /files/:id/data', () => {
    it('should retrieve the content of a file', () => new Promise((done) => {
      chai.request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal('Hello World!');
          done();
        });
    }));
  });
});
