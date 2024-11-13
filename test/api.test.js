const request = require('supertest');
const app = require('../api');
const makeid = require('../src/utils/id-generator');

let idStr = makeid(5);

describe('swapi integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return a person', async () => {
    const response = await request(app).get('/get-info-person/1');
    expect(response.status).toBe(200);
  });
  it('should return a film', async () => {
    const response = await request(app).get('/get-info-film/1');
    expect(response.status).toBe(200);
  });
});
describe('dynamodb integration', () => {     
  it('should save a user', async () => {
    const response = await request(app).post('/user-favorite-film').send({userId: idStr, name: 'test', filmId: '1', filmTitle: 'A New Hope'});
    expect(response.status).toBe(200);
  });
  it('should return a users', async () => {
    const response = await request(app).get('/user-favorite-film/'+idStr);
    expect(response.status).toBe(200);
  });
});