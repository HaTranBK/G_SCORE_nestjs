import { Controller, Get, Param } from '@nestjs/common';
import { StudentsService } from './students.service';
import { FindStudentDto } from './dto/students.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get(':sbd')
  findOne(@Param() params: FindStudentDto) {
    return this.studentsService.findOne(params.sbd);
  }
}
