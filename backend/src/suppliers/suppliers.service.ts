import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseError } from 'pg';
import { DatabaseService, TransactionContext } from '../database/database.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly database:DatabaseService){}
  list(context:TransactionContext){return this.database.withContext(context,async client=>(await this.database.query(client,`select id,person_type as "personType",legal_name as "legalName",trade_name as "tradeName",tax_id as "taxId",primary_specialty as "primarySpecialty",email,phone,average_lead_time_days as "averageLeadTimeDays",status,version from app.suppliers where organization_id=$1 order by legal_name`,[context.organizationId])).rows)}
  async create(context:TransactionContext,input:CreateSupplierDto){try{return await this.database.withContext(context,async client=>(await this.database.query(client,`insert into app.suppliers(organization_id,person_type,legal_name,trade_name,tax_id,primary_specialty,email,phone,average_lead_time_days,notes,created_by,updated_by) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) returning id,person_type as "personType",legal_name as "legalName",trade_name as "tradeName",tax_id as "taxId",primary_specialty as "primarySpecialty",email,phone,average_lead_time_days as "averageLeadTimeDays",status,version`,[context.organizationId,input.personType,input.legalName,input.tradeName??null,input.taxId,input.primarySpecialty,input.email,input.phone,input.averageLeadTimeDays,input.notes??null,context.userId])).rows[0])}catch(error){if(error instanceof DatabaseError&&error.code==='23505')throw new ConflictException('CPF/CNPJ já cadastrado nesta organização');throw error}}
}
