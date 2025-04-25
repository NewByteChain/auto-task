// src/math.test.ts
import { getDexData} from '../src/services/monitor.sol.debot';

describe('Math functions', () => {
  test('测试getDebotDataByAddress()',async () => {
    var json = await getDexData({address:'G5e2XonmccmdKc98g3eNQe5oBYGw9m8xdMUvVtcZpump'});
    console.log(`测试getDebotDataByAddress :${json}`)
    expect(json).toBe(JSON);
  });

//   test('subtracts 5 - 2 to equal 3', () => {
//     expect(subtract(5, 2)).toBe(3);
//   });
});