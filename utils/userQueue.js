import Bull from 'bull';

const userQueue = new Bull('userQueue');

export default userQueue;
