using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Permissions.Entities;
using Permissions.Impl;
using Permissions.Queries;

namespace Permissions
{
    public static class PermissionsModules
    {
        public static void ApplyPermissionsDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetUserPermissionsForNoteQuery, UserPermissionsForNote>, PermissionNoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserPermissionsForNotesManyQuery, List<(Guid, UserPermissionsForNote)>>, PermissionNoteHandlerQuery>();

            services.AddScoped<IRequestHandler<GetUserPermissionsForFolderQuery, UserPermissionsForFolder>, PermissionFolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserPermissionsForFoldersManyQuery, List<(Guid, UserPermissionsForFolder)>>, PermissionFolderHandlerQuery>();

            services.AddScoped<IRequestHandler<GetPermissionUploadFileQuery, PermissionUploadFileEnum>, PermissionNoteHandlerQuery>();

            services.AddScoped<UsersOnPrivateNotesService>();
            services.AddScoped<UsersOnPrivateFoldersService>();
        }
    }
}
