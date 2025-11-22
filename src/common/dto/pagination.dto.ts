import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO base para paginación
 * Usar en todos los endpoints que retornen listados
 */
export class PaginationDto {
  @ApiPropertyOptional({ 
    description: 'Número de página (empezando en 1)', 
    minimum: 1,
    default: 1,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El número de página debe ser un entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Cantidad de registros por página', 
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit?: number = 10;

  /**
   * Calcula el offset para la consulta SQL
   */
  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}

/**
 * Interfaz para la metadata de paginación
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interfaz para respuestas paginadas
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Función helper para crear respuestas paginadas
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
