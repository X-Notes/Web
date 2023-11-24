using System;
using System.Threading;
using System.Threading.Tasks;
using Common.Channels;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Notes.Commands.Copy;
using SignalrUpdater.Impl;

namespace API.Hosted;

public class CopyNoteHosted : BackgroundService
{
    private readonly ILogger<HistoryProcessingHosted> logger;
    private readonly IServiceProvider serviceProvider;

    public CopyNoteHosted(
        ILogger<HistoryProcessingHosted> logger,
        IServiceProvider serviceProvider)
    {
        this.logger = logger;
        this.serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var item in ChannelsService.CopyNotesChannel.Reader.ReadAllAsync())
        {
            try
            {
                if (item != null)
                {
                    using var scope = serviceProvider.CreateScope();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    var signalR = scope.ServiceProvider.GetRequiredService<AppSignalRService>();

                    var resp = await mediator.Send(new CopyNoteInternalCommand(item.NoteId, item.UserId, item.FolderId));
                    if(resp != null && resp.Success)
                    {
                        await signalR.SendNewCopiedNoteResult(resp.Data.UserId, resp.Data);
                    }
                }
            }
            catch (Exception e)
            {
                logger.LogError(e.ToString());
            }
        }
    }
}
