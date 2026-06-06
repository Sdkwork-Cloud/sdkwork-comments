import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';

import type { EngagementFavoriteDeleteResponse, EngagementFavoriteResponse, EngagementReactionDeleteResponse, EngagementReactionResponse, EngagementSummaryResponse, EngagementTargetKind, EngagementVisitCreateRequest, EngagementVisitListResponse, EngagementVisitResponse } from '../types';


export interface EngagementVisitsListParams {
  page?: number;
  pageSize?: number;
  targetKind?: EngagementTargetKind;
  targetId?: string;
}

export class EngagementVisitsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Record a visit for any supported content target. */
  async create(targetKind: EngagementTargetKind, targetId: string, body: EngagementVisitCreateRequest): Promise<EngagementVisitResponse> {
    return this.client.post<EngagementVisitResponse>(appApiPath(`/engagement/targets/${serializePathParameter(targetKind, { name: 'targetKind', style: 'simple', explode: false })}/${serializePathParameter(targetId, { name: 'targetId', style: 'simple', explode: false })}/visits`), body, undefined, undefined, 'application/json');
  }

/** List the current user's cross-content visit history. */
  async list(params?: EngagementVisitsListParams): Promise<EngagementVisitListResponse> {
    const query = buildQueryString([
      { name: 'page', value: params?.page, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'target_kind', value: params?.targetKind, style: 'form', explode: true, allowReserved: false },
      { name: 'target_id', value: params?.targetId, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.get<EngagementVisitListResponse>(appendQueryString(appApiPath(`/engagement/visits`), query));
  }
}

export class EngagementFavoritesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Favorite any supported content target. */
  async upsert(targetKind: EngagementTargetKind, targetId: string): Promise<EngagementFavoriteResponse> {
    return this.client.put<EngagementFavoriteResponse>(appApiPath(`/engagement/targets/${serializePathParameter(targetKind, { name: 'targetKind', style: 'simple', explode: false })}/${serializePathParameter(targetId, { name: 'targetId', style: 'simple', explode: false })}/favorites`));
  }

/** Remove a favorite from any supported content target. */
  async delete(targetKind: EngagementTargetKind, targetId: string): Promise<EngagementFavoriteDeleteResponse> {
    return this.client.delete<EngagementFavoriteDeleteResponse>(appApiPath(`/engagement/targets/${serializePathParameter(targetKind, { name: 'targetKind', style: 'simple', explode: false })}/${serializePathParameter(targetId, { name: 'targetId', style: 'simple', explode: false })}/favorites`));
  }
}

export class EngagementLikesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Like any supported content target. */
  async upsert(targetKind: EngagementTargetKind, targetId: string): Promise<EngagementReactionResponse> {
    return this.client.put<EngagementReactionResponse>(appApiPath(`/engagement/targets/${serializePathParameter(targetKind, { name: 'targetKind', style: 'simple', explode: false })}/${serializePathParameter(targetId, { name: 'targetId', style: 'simple', explode: false })}/likes`));
  }

/** Remove a like from any supported content target. */
  async delete(targetKind: EngagementTargetKind, targetId: string): Promise<EngagementReactionDeleteResponse> {
    return this.client.delete<EngagementReactionDeleteResponse>(appApiPath(`/engagement/targets/${serializePathParameter(targetKind, { name: 'targetKind', style: 'simple', explode: false })}/${serializePathParameter(targetId, { name: 'targetId', style: 'simple', explode: false })}/likes`));
  }
}

export class EngagementTargetsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Get cross-content engagement summary for a target. */
  async summary(targetKind: EngagementTargetKind, targetId: string): Promise<EngagementSummaryResponse> {
    return this.client.get<EngagementSummaryResponse>(appApiPath(`/engagement/targets/${serializePathParameter(targetKind, { name: 'targetKind', style: 'simple', explode: false })}/${serializePathParameter(targetId, { name: 'targetId', style: 'simple', explode: false })}/summary`));
  }
}

export class EngagementApi {
  private client: HttpClient;
  public readonly targets: EngagementTargetsApi;
  public readonly likes: EngagementLikesApi;
  public readonly favorites: EngagementFavoritesApi;
  public readonly visits: EngagementVisitsApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.targets = new EngagementTargetsApi(client);
    this.likes = new EngagementLikesApi(client);
    this.favorites = new EngagementFavoritesApi(client);
    this.visits = new EngagementVisitsApi(client);
  }

}

export function createEngagementApi(client: HttpClient): EngagementApi {
  return new EngagementApi(client);
}

function appendQueryString(path: string, rawQueryString: string): string {
  const query = rawQueryString.replace(/^\?+/, '');
  if (!query) {
    return path;
  }
  return path.includes('?') ? `${path}&${query}` : `${path}?${query}`;
}

interface PathParameterSpec {
  name: string;
  style: string;
  explode: boolean;
}

function serializePathParameter(value: unknown, spec: PathParameterSpec): string {
  if (value === undefined || value === null) {
    return '';
  }

  const style = spec.style || 'simple';
  if (Array.isArray(value)) {
    return serializePathArray(spec.name, value, style, spec.explode);
  }
  if (typeof value === 'object') {
    return serializePathObject(spec.name, value as Record<string, unknown>, style, spec.explode);
  }
  return pathPrefix(spec.name, style, false) + encodePathValue(serializePathPrimitive(value));
}

function serializePathArray(name: string, values: unknown[], style: string, explode: boolean): string {
  const serialized = values
    .filter((item) => item !== undefined && item !== null)
    .map((item) => encodePathValue(serializePathPrimitive(item)));
  if (serialized.length === 0) {
    return pathPrefix(name, style, false);
  }
  if (style === 'matrix') {
    return explode
      ? serialized.map((item) => `;${name}=${item}`).join('')
      : `;${name}=${serialized.join(',')}`;
  }
  return pathPrefix(name, style, false) + serialized.join(explode ? '.' : ',');
}

function serializePathObject(name: string, value: Record<string, unknown>, style: string, explode: boolean): string {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return pathPrefix(name, style, true);
  }
  if (style === 'matrix') {
    return explode
      ? entries.map(([key, entryValue]) => `;${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join('')
      : `;${name}=${entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',')}`;
  }
  const serialized = explode
    ? entries.map(([key, entryValue]) => `${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join(style === 'label' ? '.' : ',')
    : entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',');
  return pathPrefix(name, style, true) + serialized;
}

function pathPrefix(name: string, style: string, _objectValue: boolean): string {
  if (style === 'label') return '.';
  if (style === 'matrix') return `;${name}`;
  return '';
}

function encodePathValue(value: string): string {
  return encodeURIComponent(value);
}

function serializePathPrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
interface QueryParameterSpec {
  name: string;
  value: unknown;
  style: string;
  explode: boolean;
  allowReserved: boolean;
  contentType?: string;
}

function buildQueryString(parameters: QueryParameterSpec[]): string {
  const pairs: string[] = [];
  for (const parameter of parameters) {
    appendSerializedParameter(pairs, parameter);
  }
  return pairs.join('&');
}

function appendSerializedParameter(pairs: string[], parameter: QueryParameterSpec): void {
  if (parameter.value === undefined || parameter.value === null) {
    return;
  }

  if (parameter.contentType) {
    pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(JSON.stringify(parameter.value), parameter.allowReserved)}`);
    return;
  }

  const style = parameter.style || 'form';
  if (style === 'deepObject') {
    appendDeepObjectParameter(pairs, parameter.name, parameter.value, parameter.allowReserved);
    return;
  }

  if (Array.isArray(parameter.value)) {
    appendArrayParameter(pairs, parameter.name, parameter.value, style, parameter.explode, parameter.allowReserved);
    return;
  }

  if (typeof parameter.value === 'object') {
    appendObjectParameter(pairs, parameter.name, parameter.value as Record<string, unknown>, style, parameter.explode, parameter.allowReserved);
    return;
  }

  pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(serializePrimitive(parameter.value), parameter.allowReserved)}`);
}

function appendArrayParameter(
  pairs: string[],
  name: string,
  value: unknown[],
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const values = value
    .filter((item) => item !== undefined && item !== null)
    .map((item) => serializePrimitive(item));
  if (values.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const item of values) {
      pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(item, allowReserved)}`);
    }
    return;
  }

  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(values.join(','), allowReserved)}`);
}

function appendObjectParameter(
  pairs: string[],
  name: string,
  value: Record<string, unknown>,
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const [key, entryValue] of entries) {
      pairs.push(`${encodeQueryComponent(key)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
    }
    return;
  }

  const serialized = entries.flatMap(([key, entryValue]) => [key, serializePrimitive(entryValue)]).join(',');
  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serialized, allowReserved)}`);
}

function appendDeepObjectParameter(
  pairs: string[],
  name: string,
  value: unknown,
  allowReserved: boolean,
): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serializePrimitive(value), allowReserved)}`);
    return;
  }

  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    if (entryValue === undefined || entryValue === null) {
      continue;
    }
    pairs.push(`${encodeQueryComponent(`${name}[${key}]`)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
  }
}

function serializePrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function encodeQueryComponent(value: string): string {
  return encodeURIComponent(value);
}

function encodeQueryValue(value: string, allowReserved: boolean): string {
  const encoded = encodeURIComponent(value);
  if (!allowReserved) {
    return encoded;
  }
  return encoded.replace(/%3A/gi, ':')
    .replace(/%2F/gi, '/')
    .replace(/%3F/gi, '?')
    .replace(/%23/gi, '#')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
    .replace(/%40/gi, '@')
    .replace(/%21/gi, '!')
    .replace(/%24/gi, '$')
    .replace(/%26/gi, '&')
    .replace(/%27/gi, "'")
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%2A/gi, '*')
    .replace(/%2B/gi, '+')
    .replace(/%2C/gi, ',')
    .replace(/%3B/gi, ';')
    .replace(/%3D/gi, '=');
}
