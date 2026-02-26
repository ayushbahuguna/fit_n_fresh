import { NextResponse } from 'next/server';

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function error(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, message }, { status });
}

export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbidden(message = 'Forbidden'): NextResponse {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

export function notFound(message = 'Not found'): NextResponse {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

export function serverError(message = 'Internal server error'): NextResponse {
  return NextResponse.json({ success: false, message }, { status: 500 });
}
