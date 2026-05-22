export class NMSError extends Error {
  constructor(code, message, cause) {
    super(message ?? code);
    this.name = 'NMSError';
    this.code = code;
    if (cause) this.cause = cause;
  }
}

export class TenantViolationError extends NMSError {
  constructor(message = 'Cross-tenant access blocked') {
    super('tenant_violation', message);
    this.name = 'TenantViolationError';
  }
}

export class InviteExpiredError extends NMSError {
  constructor() {
    super('invite_expired', 'This invite link has expired.');
    this.name = 'InviteExpiredError';
  }
}

export class InviteUsedError extends NMSError {
  constructor() {
    super('invite_used', 'This invite link has already been used.');
    this.name = 'InviteUsedError';
  }
}

export class InvalidCredentialsError extends NMSError {
  constructor() {
    super('invalid_credentials', 'Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export class NotFoundError extends NMSError {
  constructor(message = 'Not found') {
    super('not_found', message);
    this.name = 'NotFoundError';
  }
}

export class EmailNotRegisteredError extends NMSError {
  constructor() {
    super('email_not_registered', 'This email is not registered.');
    this.name = 'EmailNotRegisteredError';
  }
}

export class InvalidOtpError extends NMSError {
  constructor() {
    super('invalid_otp', 'The verification code you entered is incorrect.');
    this.name = 'InvalidOtpError';
  }
}

export class OtpExpiredError extends NMSError {
  constructor() {
    super('otp_expired', 'This verification code has expired. Request a new one.');
    this.name = 'OtpExpiredError';
  }
}
