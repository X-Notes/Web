using Common.DTO;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Encryption.Commands;
using Noots.Encryption.Impl;
using Noots.Encryption.Queries;

namespace Noots.Encryption
{
    public static class EncryptionModules
    {
        public static void ApplyEncryptionDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<DecriptionNoteCommand, OperationResult<bool>>, EncryptionHandlerCommand>();
            services.AddScoped<IRequestHandler<EncryptionNoteCommand, OperationResult<bool>>, EncryptionHandlerCommand>();

            services.AddScoped<IRequestHandler<UnlockNoteQuery, OperationResult<bool>>, EncryptionHandlerQuery>();

            services.AddScoped<UserNoteEncryptService>();

            services.AddSingleton<AppEncryptor>();
        }
    }
}
