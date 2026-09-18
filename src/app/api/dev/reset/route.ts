import { NextResponse } from 'next/server';

/**
 * POST /api/dev/reset
 *
 * SECURITY: This endpoint is DISABLED in production.
 * In development, it requires ADMIN role and explicit ENABLE_DEV_AUTH flag.
 *
 * For the evaluation prototype, this endpoint is intentionally removed
 * from the normal application path.
 */
export async function POST() {
  // Disabled in production unconditionally
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not found.' },
      { status: 404 }
    );
  }

  // In development, require explicit evaluation mode flag
  if (process.env.ENABLE_DEV_AUTH !== 'true') {
    return NextResponse.json(
      {
        error: 'Database reset is only available in development evaluation mode.',
        code: 'EVAL_MODE_REQUIRED',
      },
      { status: 403 }
    );
  }

  // Additional safety: require a specific confirmation header to prevent accidental invocation
  // This is called from /admin/evaluation-tools UI which sets this header
  return NextResponse.json(
    {
      error: 'Database reset must be performed through the Evaluation Tools panel at /admin/evaluation-tools.',
      code: 'USE_EVAL_TOOLS',
    },
    { status: 403 }
  );
}
