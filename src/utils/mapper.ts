export class ObjectMapper {
  public static transformPropertyName(
    obj: any,
    value: any,
    propertyName: string,
  ) {
    const tokens = propertyName.split('_');
    if (tokens.length == 1) {
      obj[propertyName] = value;
    } else {
      let [firstToken, newPropertyName, ...rest] = tokens;
      newPropertyName = rest.reduce((prev: string, curr: string) => {
        return `${prev}${curr[0].toUpperCase()}${curr.substring(1).toLowerCase()}`;
      }, newPropertyName);
      obj[newPropertyName] = value;
    }
  }

  public static mapper(obj: any) {
    const res = {};
    Object.keys(obj).forEach((key: string) => {
      ObjectMapper.transformPropertyName(res, obj[key], key);
    });
    return Object.keys(res).length == 0 ? null : res;
  }

  public static mapRawToEntity<T>(
    rawResult: any,
    alias: string,
    aliasChildrens: string[],
    childrenProperties: string[],
  ): T {
    const entity = {};
    const aliasKeyMap = {};
    childrenProperties.forEach((item, index) => {
      entity[item] = [];
      aliasKeyMap[aliasChildrens[index]] = {};
    });
    Object.values(rawResult).forEach((row) => {
      childrenProperties.forEach((item, index) => {
        aliasKeyMap[aliasChildrens[index]] = {};
      });
      Object.keys(row).forEach((key) => {
        if (key.startsWith(alias)) {
          ObjectMapper.transformPropertyName(entity, row[key], key);
        }

        aliasChildrens.forEach((als) => {
          if (key.startsWith(als)) {
            ObjectMapper.transformPropertyName(aliasKeyMap[als], row[key], key);
          }
        });
      });
      childrenProperties.forEach((item, index) => {
        entity[item].push(aliasKeyMap[aliasChildrens[index]]);
      });
    });
    return entity as T;
  }

  public static mapToEntitiesFromRawResults(
    rawResults: any[],
    prefixes: string[],
  ) {
    return rawResults.map((rawObj) => {
      let entity = {};
      prefixes.forEach((prefix: string) => {
        let obj = {};
        Object.keys(rawObj).forEach((key) => {
          if (key.startsWith(prefix)) {
            obj = { ...obj, [key]: rawObj[key] };
          }
        });
        entity = { ...entity, [prefix]: ObjectMapper.mapper(obj) };
      });
      return entity;
    });
  }
}
