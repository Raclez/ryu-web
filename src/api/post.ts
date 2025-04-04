
import { http } from '@/utils/http/index.ts'
export async function getBlogById(id: string) {
   return http.get(`/api/blog/${id}`);
}
