import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, TransactionContext } from '../database/database.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly database: DatabaseService) {}

  list(context: TransactionContext) {
    return this.database.withContext(context, async (client) => (await this.database.query(client, `
      select id, name, address, built_area_m2 as "builtAreaM2", approved_budget as "approvedBudget",
             planned_start as "plannedStart", planned_end as "plannedEnd", status, version
      from app.projects where organization_id = $1 order by created_at desc`, [context.organizationId])).rows);
  }

  get(context: TransactionContext, projectId: string) {
    return this.database.withContext(context, async (client) => {
      const result = await this.database.query(client, `
        select id, name, address, built_area_m2 as "builtAreaM2", approved_budget as "approvedBudget",
               planned_start as "plannedStart", planned_end as "plannedEnd", status, version
        from app.projects where organization_id = $1 and id = $2`, [context.organizationId, projectId]);
      if (!result.rowCount) throw new NotFoundException('Obra não encontrada');
      return result.rows[0];
    });
  }

  create(context: TransactionContext, input: CreateProjectDto) {
    return this.database.withContext(context, async (client) => {
      const result = await this.database.query(client, `
        insert into app.projects(organization_id, name, address, built_area_m2, approved_budget, planned_start, planned_end, status, technical_responsible_id, created_by, updated_by)
        values ($1,$2,$3,$4::numeric,$5::numeric,$6::date,$7::date,$8,$9,$10,$10)
        returning id, name, address, built_area_m2 as "builtAreaM2", approved_budget as "approvedBudget", planned_start as "plannedStart", planned_end as "plannedEnd", status, version`,
        [context.organizationId, input.name, input.address, input.builtAreaM2, input.approvedBudget, input.plannedStart, input.plannedEnd, input.status, input.technicalResponsibleId ?? null, context.userId]);
      return result.rows[0];
    });
  }
}
