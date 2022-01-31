import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateQuestion } from '../types/create-question.interface';

@Injectable()
export class ApiContactUsService {
  constructor(private httpClient: HttpClient) {}

  createQuestion(dto: CreateQuestion) {
    return this.httpClient.post('/admin/mail', dto);
  }
}
