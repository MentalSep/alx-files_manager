import chai from 'chai';
import redisClient from '../utils/redis';

const { expect } = chai;

describe('redisClient', () => {
  describe('isAlive', () => {
    it('should return true when connection is alive', () => {
      expect(redisClient.isAlive()).to.be.true;
    });
  });

  describe('get', () => {
    it('should retrieve the correct value for a given key', async () => {
      await redisClient.set('testKey', 'testValue', 3600);
      const value = await redisClient.get('testKey');
      expect(value).to.equal('testValue');
    });
  });

  describe('set', () => {
    it('should set a value for a given key', async () => {
      await redisClient.set('testKey', 'testValue', 3600);
      const value = await redisClient.get('testKey');
      expect(value).to.equal('testValue');
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      await redisClient.set('testKey', 'testValue', 3600);
      await redisClient.del('testKey');
      const value = await redisClient.get('testKey');
      expect(value).to.be.null;
    });
  });
});
