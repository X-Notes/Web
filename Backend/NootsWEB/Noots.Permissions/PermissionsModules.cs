using Microsoft.Extensions.DependencyInjection;
using MediatR;
using Noots.Permissions.Entities;
using Noots.Permissions.Impl;
using Noots.Permissions.Queries;

namespace Noots.Permissions
{
    public static class PermissionsModules
    {
        public static void ApplyPermissionsDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetUserPermissionsForNoteQuery, UserPermissionsForNote>, PermissionHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserPermissionsForNotesManyQuery, List<(Guid, UserPermissionsForNote)>>, PermissionHandlerQuery>();

            services.AddScoped<IRequestHandler<GetUserPermissionsForFolderQuery, UserPermissionsForFolder>, PermissionHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserPermissionsForFoldersManyQuery, List<(Guid, UserPermissionsForFolder)>>, PermissionHandlerQuery>();

            services.AddScoped<IRequestHandler<GetPermissionUploadFileQuery, PermissionUploadFileEnum>, PermissionHandlerQuery>();
        }
    }
}
