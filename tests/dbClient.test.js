import { expect } from 'chai';
import dbClient from '../utils/db';

describe('dBClient', () => {
  describe('isAlive', () => {
    it('should return true when connection is alive', () => new Promise((done) => {
      setTimeout(() => {
        expect(dbClient.isAlive()).to.be.true;
        done();
      }, 10);
    }));
  });

  describe('nbUsers', () => {
    it('should return the correct number of users', async () => {
      const usersCount = await dbClient.nbUsers();
      expect(usersCount).to.be.a('number');
    });
  });

  describe('nbFiles', () => {
    it('should return the correct number of files', async () => {
      const filesCount = await dbClient.nbFiles();
      expect(filesCount).to.be.a('number');
    });
  });
});
