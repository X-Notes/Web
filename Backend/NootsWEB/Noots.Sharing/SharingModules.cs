using Common.DTO;
using Common.DTO.Users;
using Domain.Commands.Share.Folders;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Sharing.Commands.Folders;
using Noots.Sharing.Commands.Notes;
using Noots.Sharing.Impl;
using Noots.Sharing.Queries;

namespace Noots.Sharing
{
    public static class SharingModules
    {
        public static void ApplySharingDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetUsersOnPrivateNoteQuery, List<InvitedUsersToFoldersOrNote>>, SharingHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUsersOnPrivateFolderQuery, List<InvitedUsersToFoldersOrNote>>, SharingHandlerQuery>();

            services.AddScoped<IRequestHandler<ChangeRefTypeFolders, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeRefTypeNotes, OperationResult<Unit>>, SharingHandlerCommand>();

            services.AddScoped<IRequestHandler<PermissionUserOnPrivateNotes, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveUserFromPrivateNotes, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<SendInvitesToUsersNotes, OperationResult<Unit>>, SharingHandlerCommand>();

            services.AddScoped<IRequestHandler<PermissionUserOnPrivateFolders, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveUserFromPrivateFolders, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<SendInvitesToUsersFolders, Unit>, SharingHandlerCommand>();

            services.AddScoped<IRequestHandler<RemoveAllUsersFromNoteCommand, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveAllUsersFromFolderCommand, OperationResult<Unit>>, SharingHandlerCommand>();
        }
    }
}