import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService, TransactionContext } from '../database/database.service';
import { AssignStageDto } from './dto/assign-stage.dto';
import { AssignServiceDto } from './dto/assign-service.dto';
import { CreateDependencyDto } from './dto/create-dependency.dto';

@Injectable()
export class ProjectConfigService {
  constructor(private readonly db: DatabaseService) {}

  list(context: TransactionContext, projectId: string) {
    return this.db.withContext(context, async (client) => ({
      stages: (await this.db.query(client, `select ps.id,ps.catalog_stage_id as "catalogStageId",sc.name,ps.display_order as "displayOrder",ps.planned_start as "plannedStart",ps.planned_end as "plannedEnd",ps.physical_weight as "physicalWeight",ps.progress_percentage as "progressPercentage",ps.status from app.project_stages ps join app.stage_catalog sc on sc.organization_id=ps.organization_id and sc.id=ps.catalog_stage_id where ps.organization_id=$1 and ps.project_id=$2 order by ps.display_order`, [context.organizationId, projectId])).rows,
      dependencies: (await this.db.query(client, `select id,predecessor_stage_id as "predecessorStageId",successor_stage_id as "successorStageId",dependency_type as "dependencyType",lag_days as "lagDays",reason from app.project_stage_dependencies where organization_id=$1 and project_id=$2`, [context.organizationId, projectId])).rows,
    }));
  }

  addStage(context: TransactionContext, projectId: string, input: AssignStageDto) {
    if (input.plannedEnd < input.plannedStart) throw new BadRequestException('Término deve ser posterior ao início');
    return this.db.withContext(context, async (client) => {
      const stage = (await this.db.query<{ id: string }>(client, `insert into app.project_stages(organization_id,project_id,catalog_stage_id,display_order,planned_start,planned_end,physical_weight,notes,created_by,updated_by) values($1,$2,$3,$4,$5::date,$6::date,$7::numeric,$8,$9,$9) returning id,catalog_stage_id as "catalogStageId",display_order as "displayOrder",planned_start as "plannedStart",planned_end as "plannedEnd",physical_weight as "physicalWeight",status,version`, [context.organizationId, projectId, input.catalogStageId, input.displayOrder, input.plannedStart, input.plannedEnd, input.physicalWeight, input.notes ?? null, context.userId])).rows[0];
      if (!stage) throw new Error('A etapa não foi criada');
      if (input.primarySupplierId) await this.db.query(client, `insert into app.project_supplier_assignments(organization_id,project_id,project_stage_id,supplier_id,role_code,created_by) values($1,$2,$3,$4,'primary',$5)`, [context.organizationId, projectId, stage.id, input.primarySupplierId, context.userId]);
      return stage;
    });
  }

  addService(context: TransactionContext, projectId: string, input: AssignServiceDto) {
    return this.db.withContext(context, async (client) => {
      // Serviço e fornecedor formam uma única unidade de negócio. Se a segunda
      // gravação falhar, `withContext` desfaz também o serviço e evita cadastro órfão.
      const service = (await this.db.query<{ id: string }>(client, `insert into app.project_services(organization_id,project_id,project_stage_id,catalog_service_id,environment_id,quantity,physical_weight,progress_criterion,created_by,updated_by) values($1,$2,$3,$4,$5,$6::numeric,$7::numeric,$8,$9,$9) returning id,project_stage_id as "projectStageId",catalog_service_id as "catalogServiceId",quantity,physical_weight as "physicalWeight",progress_criterion as "progressCriterion",status,version`, [context.organizationId, projectId, input.projectStageId, input.catalogServiceId, input.environmentId ?? null, input.quantity, input.physicalWeight, input.progressCriterion, context.userId])).rows[0];
      if (!service) throw new Error('O serviço não foi criado');
      await this.db.query(client, `insert into app.project_supplier_assignments(organization_id,project_id,project_service_id,supplier_id,role_code,created_by) values($1,$2,$3,$4,'primary',$5)`, [context.organizationId, projectId, service.id, input.supplierId, context.userId]);
      return service;
    });
  }

  addDependency(context: TransactionContext, projectId: string, input: CreateDependencyDto) {
    // A validação rápida melhora a mensagem; o banco repete a proteção e também
    // detecta ciclos indiretos para chamadas concorrentes ou outros clientes.
    if (input.predecessorStageId === input.successorStageId) throw new BadRequestException('Predecessor e sucessor devem ser diferentes');
    return this.db.withContext(context, async (client) => (await this.db.query(client, `insert into app.project_stage_dependencies(organization_id,project_id,predecessor_stage_id,successor_stage_id,dependency_type,lag_days,reason,created_by) values($1,$2,$3,$4,$5,$6,$7,$8) returning id,predecessor_stage_id as "predecessorStageId",successor_stage_id as "successorStageId",dependency_type as "dependencyType",lag_days as "lagDays",reason`, [context.organizationId, projectId, input.predecessorStageId, input.successorStageId, input.dependencyType, input.lagDays, input.reason ?? null, context.userId])).rows[0]);
  }
}
