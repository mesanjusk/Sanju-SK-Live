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

UsersSchema.pre('save', function (next) {
  if (this.isModified('role') && !this.isModified('permissions')) {
    this.permissions = { ...ROLE_DEFAULTS[this.role] };
  }
  next();
});

export { ROLE_DEFAULTS };
export default mongoose.model('Users', UsersSchema);
