import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 创建响应并设置过期的 cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'auth-token',
      value: '',
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Failed to logout:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 