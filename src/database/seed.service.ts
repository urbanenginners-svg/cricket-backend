import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/user/user.entity';
import { Role } from '../modules/role/role.entity';
import { Permission } from '../modules/permission/permission.entity';
import { File } from '../modules/file/file.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) { }

  async onApplicationBootstrap() {
    await this.seedDatabase();
  }

  private async seedDatabase() {
    this.logger.log('Starting database seeding...');

    try {
      // 1. Seed Permissions
      await this.seedPermissions();

      // 2. Seed Roles
      await this.seedRoles();

      // 3. Assign Permissions to Roles
      await this.assignPermissionsToRoles();

      // 4. Seed SuperAdmin User
      await this.seedSuperAdmin();

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
    }
  }

  private async seedPermissions() {
    this.logger.log('Seeding permissions...');

    const permissions = [
      // User permissions
      {
        name: 'users.create',
        resource: 'user',
        action: 'create',
        description: 'Create new users',
      },
      {
        name: 'users.read',
        resource: 'user',
        action: 'read',
        description: 'View user information',
      },
      {
        name: 'users.update',
        resource: 'user',
        action: 'update',
        description: 'Update user information',
      },
      {
        name: 'users.delete',
        resource: 'user',
        action: 'delete',
        description: 'Delete users',
      },
      {
        name: 'users.manage',
        resource: 'user',
        action: 'manage',
        description: 'Full user management',
      },

      // Role permissions
      {
        name: 'roles.create',
        resource: 'role',
        action: 'create',
        description: 'Create new roles',
      },
      {
        name: 'roles.read',
        resource: 'role',
        action: 'read',
        description: 'View role information',
      },
      {
        name: 'roles.update',
        resource: 'role',
        action: 'update',
        description: 'Update role information',
      },
      {
        name: 'roles.delete',
        resource: 'role',
        action: 'delete',
        description: 'Delete roles',
      },
      {
        name: 'roles.manage',
        resource: 'role',
        action: 'manage',
        description: 'Full role management',
      },

      // Permission permissions
      {
        name: 'permissions.create',
        resource: 'permission',
        action: 'create',
        description: 'Create new permissions',
      },
      {
        name: 'permissions.read',
        resource: 'permission',
        action: 'read',
        description: 'View permission information',
      },
      {
        name: 'permissions.update',
        resource: 'permission',
        action: 'update',
        description: 'Update permission information',
      },
      {
        name: 'permissions.delete',
        resource: 'permission',
        action: 'delete',
        description: 'Delete permissions',
      },
      {
        name: 'permissions.manage',
        resource: 'permission',
        action: 'manage',
        description: 'Full permission management',
      },

      // File permissions
      {
        name: 'files.create',
        resource: 'file',
        action: 'create',
        description: 'Upload and create new files',
      },
      {
        name: 'files.read',
        resource: 'file',
        action: 'read',
        description: 'View and download files',
      },
      {
        name: 'files.update',
        resource: 'file',
        action: 'update',
        description: 'Update file metadata',
      },
      {
        name: 'files.delete',
        resource: 'file',
        action: 'delete',
        description: 'Delete files',
      },
      {
        name: 'files.manage',
        resource: 'file',
        action: 'manage',
        description: 'Full file management including hard deletion',
      },
    ];

    for (const permissionData of permissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        this.logger.log(`Created permission: ${permissionData.name}`);
      } else {
        this.logger.log(`Permission already exists: ${permissionData.name}`);
      }
    }
  }

  private async seedRoles() {
    this.logger.log('Seeding roles...');

    const roles = [
      {
        name: 'superadmin',
        description: 'Super Administrator with full system access',
        isActive: true,
      },
      {
        name: 'admin',
        description: 'Administrator with user management access',
        isActive: true,
      },
      {
        name: 'user',
        description: 'Basic user with limited access',
        isActive: true,
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        this.logger.log(`Created role: ${roleData.name}`);
      } else {
        this.logger.log(`Role already exists: ${roleData.name}`);
      }
    }
  }

  private async assignPermissionsToRoles() {
    this.logger.log('Assigning permissions to roles...');

    // Get roles
    const superAdminRole = await this.roleRepository.findOne({
      where: { name: 'superadmin' },
      relations: ['permissions'],
    });

    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
      relations: ['permissions'],
    });

    const userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
      relations: ['permissions'],
    });

    // Get all permissions
    const allPermissions = await this.permissionRepository.find();

    // 1. Define explicit permission lists for each role
    // User can manually edit these arrays to configure permissions
    const superAdminPermissions = allPermissions.map((p) => p.name); // Default: All

    const adminPermissions = [
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'roles.read',
      'files.create',
      'files.read',
      'files.update',
      'files.delete',
    ];

    const userPermissions = [
      'users.read',
      'roles.read',
      'files.read',
      'files.create',
    ];

    // 2. Helper function to map permission names to entities
    const mapPermissions = (permissionNames: string[]) => {
      return allPermissions.filter((p) => permissionNames.includes(p.name));
    };

    // 3. Assign permissions
    if (superAdminRole && superAdminRole.permissions.length === 0) {
      superAdminRole.permissions = mapPermissions(superAdminPermissions);
      await this.roleRepository.save(superAdminRole);
      this.logger.log('Assigned permissions to superadmin role');
    }

    if (adminRole && adminRole.permissions.length === 0) {
      adminRole.permissions = mapPermissions(adminPermissions);
      await this.roleRepository.save(adminRole);
      this.logger.log('Assigned permissions to admin role');
    }

    if (userRole && userRole.permissions.length === 0) {
      userRole.permissions = mapPermissions(userPermissions);
      await this.roleRepository.save(userRole);
      this.logger.log('Assigned permissions to user role');
    }
  }

  private async seedSuperAdmin() {
    this.logger.log('Seeding super admin user...');

    const existingSuperAdmin = await this.userRepository.findOne({
      where: { email: 'superadmin@example.com' },
    });

    if (!existingSuperAdmin) {
      const superAdminRole = await this.roleRepository.findOne({
        where: { name: 'superadmin' },
      });

      if (superAdminRole) {
        const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

        const superAdmin = this.userRepository.create({
          name: 'Super Administrator',
          email: 'superadmin@example.com',
          password: hashedPassword,
          isActive: true,
          roles: [superAdminRole],
        });

        await this.userRepository.save(superAdmin);
        this.logger.log('Created super admin user: superadmin@example.com');
        this.logger.log('Super admin password: SuperAdmin123!');
      } else {
        this.logger.error(
          'SuperAdmin role not found, cannot create superadmin user',
        );
      }
    } else {
      this.logger.log('Super admin user already exists');
    }
  }
}
