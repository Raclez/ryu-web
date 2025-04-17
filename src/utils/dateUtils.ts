/**
 * 日期工具类
 */
export class DateUtils {
  /**
   * 格式化日期时间为后端所需格式
   * 保持原始格式，但处理URL编码问题
   * @param dateString 原始日期字符串
   * @returns 格式化后的日期字符串，适合作为URL参数
   */
  static formatDateForRequest(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // 直接对日期字符串进行处理，以适应URL参数 
      // 将空格替换为 T，确保不会被URL编码为 +
      return dateString.replace(' ', 'T');
    } catch (e) {
      console.error('日期格式转换错误:', e);
      return '';
    }
  }

  /**
   * 解析后端返回的日期时间
   * @param dateString 后端返回的日期字符串
   * @returns 格式化后的日期字符串，适合前端显示
   */
  static formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';

    try {
      // 创建Date对象
      const date = new Date(dateString);
      
      // 检查是否是有效日期
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('日期格式化错误:', e);
      return dateString;
    }
  }

  /**
   * 获取当前日期时间的ISO字符串，去掉毫秒部分
   * 用于需要当前时间的场景
   */
  static getCurrentISOString(): string {
    return new Date().toISOString().split('.')[0];
  }

  /**
   * URL编码日期字符串
   * 专门用于日期字符串的URL编码
   */
  static encodeDate(dateString: string): string {
    if (!dateString) return '';
    return encodeURIComponent(dateString);
  }
} 