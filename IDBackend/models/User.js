import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import mongoose from 'mongoose';

const permissionsSchema = new mongoose.Schema({
  canViewDashboard:    { type: Boolean, default: true },
  canViewAnalytics:    { type: Boolean, default: true },
  canManageProducts:   { type: Boolean, default: false },
  canManageCategories: { type: Boolean, default: false },
  canManageBanners:    { type: Boolean, default: false },
  canManageLeads:      { type: Boolean, default: false },
  canManageUsers:      { type: Boolean, default: false },
  canManageSettings:   { type: Boolean, default: false },
  canManageWhatsApp:   { type: Boolean, default: false },
}, { _id: false });

const ROLE_DEFAULTS = {
  admin:   { canViewDashboard: true, canViewAnalytics: true, canManageProducts: true, canManageCategories: true, canManageBanners: true, canManageLeads: true, canManageUsers: true, canManageSettings: true, canManageWhatsApp: true },
  manager: { canViewDashboard: true, canViewAnalytics: true, canManageProducts: true, canManageCategories: true, canManageBanners: true, canManageLeads: true, canManageUsers: false, canManageSettings: false, canManageWhatsApp: true },
  sales:   { canViewDashboard: true, canViewAnalytics: true, canManageProducts: false, canManageCategories: false, canManageBanners: false, canManageLeads: true, canManageUsers: false, canManageSettings: false, canManageWhatsApp: false },
  viewer:  { canViewDashboard: true, canViewAnalytics: true, canManageProducts: false, canManageCategories: false, canManageBanners: false, canManageLeads: false, canManageUsers: false, canManageSettings: false, canManageWhatsApp: false },
};

const UsersSchema = new mongoose.Schema({
  User_uuid:     { type: String },
  User_name:     { type: String, required: true },
  Password:      { type: String, required: true },
  Mobile_number: { type: Number, required: true, unique: true },
  role:          { type: String, enum: ['admin', 'manager', 'sales', 'viewer'], default: 'admin' },
  permissions:   { type: permissionsSchema, default: () => ({ ...ROLE_DEFAULTS.admin }) },
});

export function hashUserPassword(value) {
  const salt=randomBytes(16).toString('hex');
  const digest=scryptSync(String(value),salt,64).toString('hex');
  return 'scrypt$'+salt+'$'+digest;
}
export function checkUserPassword(entered,stored) {
  if(typeof entered!=='string'||typeof stored!=='string')return false;
  if(stored.startsWith('scrypt$')){
    const [,salt,hash]=stored.split('$');
    if(!salt||!/^[a-f0-9]{128}$/i.test(hash||''))return false;
    const expected=Buffer.from(hash,'hex'),actual=scryptSync(entered,salt,64);
    return timingSafeEqual(expected,actual);
  }
  // One-time migration of existing legacy passwords.
  const enteredBuffer=Buffer.from(entered),storedBuffer=Buffer.from(stored);
  return enteredBuffer.length===storedBuffer.length && timingSafeEqual(enteredBuffer,storedBuffer);
}
UsersSchema.pre('save', function (next) {
  if(this.isModified('Password') && !this.Password.startsWith('scrypt$')){
    this.Password=hashUserPassword(this.Password);
  }
  if (this.isModified('role') && !this.isModified('permissions')) {
    this.permissions = { ...ROLE_DEFAULTS[this.role] };
  }
  next();
});

export { ROLE_DEFAULTS };
export default mongoose.model('Users', UsersSchema);
