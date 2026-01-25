import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../../modules/user/user.entity';
import { Role } from '../../modules/role/role.entity';
import { Permission } from '../../modules/permission/permission.entity';
import { File } from '../../modules/file/file.entity';

// Define the actions that can be performed
export enum Action {
  MANAGE = 'manage', // Special action that represents any action
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Define the subjects (resources) that actions can be performed on
export type Subjects =
  | InferSubjects<
    | typeof User
    | typeof Role
    | typeof Permission
    | typeof File
  >
  | 'all';

// Define the Ability type
export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  /**
   * Create ability based on user and their roles/permissions
   */
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (user.roles && user.roles.length > 0) {
      // Check if user is superadmin
      const isSuperAdmin = user.roles.some(
        (role) => role.name === 'superadmin',
      );

      if (isSuperAdmin) {
        // Superadmin can do anything
        can(Action.MANAGE, 'all');
      } else {
        // Regular users - check specific permissions
        const permissions = this.getUserPermissions(user);

        permissions.forEach((permission) => {
          const action = this.mapPermissionToAction(permission.action);
          const subject = this.mapResourceToSubject(permission.resource);

          if (action && subject) {
            can(action, subject);
          }
        });
      }
    } else {
      // Users without roles can only read their own profile
      can(Action.READ, User, { id: user.id });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  /**
   * Extract all permissions from user's roles
   */
  private getUserPermissions(user: User): Permission[] {
    const permissions: Permission[] = [];

    user.roles.forEach((role) => {
      if (role.permissions && role.isActive) {
        role.permissions.forEach((permission) => {
          if (
            permission.isActive &&
            !permissions.find((p) => p.id === permission.id)
          ) {
            permissions.push(permission);
          }
        });
      }
    });

    return permissions;
  }

  /**
   * Map permission action string to CASL Action enum
   */
  private mapPermissionToAction(actionString: string): Action | null {
    switch (actionString.toLowerCase()) {
      case 'create':
        return Action.CREATE;
      case 'read':
        return Action.READ;
      case 'update':
        return Action.UPDATE;
      case 'delete':
        return Action.DELETE;
      case 'manage':
        return Action.MANAGE;
      default:
        return null;
    }
  }

  /**
   * Map resource string to CASL Subject
   */
  private mapResourceToSubject(resourceString: string): any {
    switch (resourceString.toLowerCase()) {
      case 'user':
        return User;
      case 'role':
        return Role;
      case 'permission':
        return Permission;
      case 'file':
        return File;
      case 'all':
        return 'all';
      default:
        return null;
    }
  }
}
