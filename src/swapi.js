//Swapi integration, scalable to any number of entities
class StarWarsAPI {
  #baseUrl = 'https://swapi.py4e.com/api';
  #entities = {
    films: "films",
    people: "people",
  }
  #getAll = (entitie) =>{
    return async () => {
      const url = `${this.#baseUrl}/${entitie}`;
      const response = await fetch(url);            
      return await response.json();  
    }
  }
  #getSchema = (entitie) =>{
    return async () => {
      const url =  `${this.#baseUrl}/${entitie}/schema`;
      const response = await fetch(url);
      return await response.json(); 
    }
  }
  #getOne = (entitie, id, populate) =>{    
    return async () => {
      const url = `${this.#baseUrl}/${entitie}/${id}`;
      const response = await fetch(url);
      const respJson = await response.json();
      if(!populate){
        return respJson
      }
      const objPopulated = {
        ...respJson
      }
      for (const key in respJson) {
        if (Array.isArray(respJson[key])) {          
          const calls = respJson[key].map(itemUrl=>fetch(itemUrl));
          const respCalls = await Promise.all(calls);
          const respCallsJson = await Promise.all(respCalls.map(item =>item.json()))
          objPopulated[key] = respCallsJson;
        }
      }      
      return objPopulated
    }
  }
  constructor() {
    this.films = {
      getAll: this.#getAll(this.#entities.films),
      getSchema: this.#getSchema(this.#entities.films),
      getOne: async (id, populate) => (await this.#getOne(this.#entities.films, id, populate))()
    }
    this.people = {
      getAll: this.#getAll(this.#entities.people),
      getSchema: this.#getSchema(this.#entities.people),
      getOne: async (id, populate) => (await this.#getOne(this.#entities.people, id, populate))()
    }
  }
}
const swapi = new StarWarsAPI();
module.exports = swapi;