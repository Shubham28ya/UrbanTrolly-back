import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import bcrypt from 'bcryptjs';

import Category from '../models/Category.js';
import AdminUser from '../models/AdminUser.js';
import UserRegistration from '../models/User.js';
import SupplierRegistration from "../models/Supplier.js"
// import heroSectionAdminOptions from './heroSection.admin.js';

AdminJS.registerAdapter(AdminJSMongoose);


const adminJs = new AdminJS({
  resources: [
    // heroSectionAdminOptions,
    {
      resource: UserRegistration,
      options: { navigation: 'User Management' },
    },
    {
      resource: SupplierRegistration,
      options: { navigation: 'Supplier Management' },
    },
    {
      resource: Category,
      options: {
        navigation: 'Catalog',
        sort: {
          sortBy: 'categoryId',
          direction: 'asc',
        },
        properties: {
          slug: { isVisible: false },
          parent: {
            reference: 'Category',
            isVisible: { list: true, filter: true, show: true, edit: true },
            isTitle: true,
            position: 3,
          },
          categoryId: {
            position: 1,
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          name: {
            position: 2,
          },
        },
        listProperties: ['categoryId', 'name', 'parent'],
        actions: {
          new: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin',
          },
          edit: {
            isAccessible: ({ currentAdmin, record }) =>
              currentAdmin?.role === 'admin' &&
              ['draft', 'rejected'].includes(record?.params.status),
          },
          delete: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin',
          },
        },
      },
    },
  // {
  //     resource: HeroSectionSchema,
  //     options: {
  //       navigation: 'Hero Section' ,
  //       properties: {
  //         items: {
  //           components: {
  //             edit: 'HeroItemsEditor',
  //           },
  //         },
  //       },
  //     },
  //   },
  ],
  assets: {
    scripts: ['/bundle.js'], // 👈 Include your bundle
  },
  rootPath: '/admin',
  branding: { companyName: 'Urban Trolly' },
});

// ✅ Auth setup
const ADMIN = {
  authenticate: async (email, password) => {
    const adminUser = await AdminUser.findOne({ email });
    if (adminUser && await bcrypt.compare(password, adminUser.encryptedPassword)) {
      return adminUser;
    }
    return null;
  },
  cookieName: 'adminjs',
  cookiePassword: 'your-cookie-secret', // make this long & secure in production
};

const router = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: ADMIN.authenticate,
    cookieName: ADMIN.cookieName,
    cookiePassword: ADMIN.cookiePassword,
  },
  null,
  {
    resave: false,
    saveUninitialized: true,
    secret: ADMIN.cookiePassword,
  }
);

export { adminJs, router };
