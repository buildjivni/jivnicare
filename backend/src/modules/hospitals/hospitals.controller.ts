import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import {
  CreateHospitalDto,
  UpdateHospitalDto,
  FilterHospitalDto,
} from './dto/hospitals.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalsService.create(createHospitalDto);
  }

  @Public()
  @Get()
  findAll(@Query() filterDto: FilterHospitalDto) {
    return this.hospitalsService.findAll(filterDto);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.hospitalsService.findOne(slug);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ) {
    return this.hospitalsService.update(id, updateHospitalDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hospitalsService.remove(id);
  }
}
