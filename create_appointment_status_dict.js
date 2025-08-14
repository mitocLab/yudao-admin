/**
 * 创建预约状态字典的脚本
 * 需要在系统管理 -> 字典管理 -> 字典类型中添加以下内容：
 * 
 * 字典类型：
 * - 字典名称：预约状态
 * - 字典类型：yaochuantang_appointment_status
 * - 状态：启用
 * - 备注：瑶川堂预约状态
 * 
 * 字典数据：
 * 1. 待服务
 *    - 字典标签：待服务
 *    - 字典键值：0
 *    - 显示排序：1
 *    - 状态：启用
 *    - 颜色类型：primary
 * 
 * 2. 服务中
 *    - 字典标签：服务中
 *    - 字典键值：1
 *    - 显示排序：2
 *    - 状态：启用
 *    - 颜色类型：warning
 * 
 * 3. 已完成
 *    - 字典标签：已完成
 *    - 字典键值：2
 *    - 显示排序：3
 *    - 状态：启用
 *    - 颜色类型：success
 * 
 * 4. 已取消
 *    - 字典标签：已取消
 *    - 字典键值：3
 *    - 显示排序：4
 *    - 状态：启用
 *    - 颜色类型：danger
 */

console.log('请在系统管理 -> 字典管理 -> 字典类型中添加以下内容：');
console.log('');
console.log('1. 添加字典类型：');
console.log('   - 字典名称：预约状态');
console.log('   - 字典类型：yaochuantang_appointment_status');
console.log('   - 状态：启用');
console.log('   - 备注：瑶川堂预约状态');
console.log('');
console.log('2. 添加字典数据：');
console.log('   - 待服务 (0) - 颜色：primary');
console.log('   - 服务中 (1) - 颜色：warning');
console.log('   - 已完成 (2) - 颜色：success');
console.log('   - 已取消 (3) - 颜色：danger');
console.log('');
console.log('添加完成后，预约状态选择器将显示正确的选项。');
