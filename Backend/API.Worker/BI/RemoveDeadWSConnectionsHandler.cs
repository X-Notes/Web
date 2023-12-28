using API.Worker.Models.Config;
using Common;
using Common.DatabaseModels.Models.WS;
using Common.DTO.WebSockets;
using Dapr.Client;
using DatabaseContext.Repositories.WS;
using Microsoft.Extensions.Options;

namespace API.Worker.BI;

public class RemoveDeadWSConnectionsHandler(UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository,
	JobsTimerConfig jobsTimerConfig,
	IOptions<DaprConfig> daprConfig,
	DaprClient daprClient,
	ILogger<RemoveDeadWSConnectionsHandler> logger)
{
	public async Task HandleAsync()
	{
		var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-jobsTimerConfig.DeleteDeadConnectionsMinutes);
		var deadConnections = await userIdentifierConnectionIdRepository.GetConnectionsByDateIncludeNotesFoldersAsync(earliestTimestamp);
		if (deadConnections.Count > 0)
		{
			var isSuccess = await SendDeadConnectionsAsync(deadConnections);
			if (isSuccess)
			{
                await userIdentifierConnectionIdRepository.RemoveRangeAsync(deadConnections);
            }
		}
	}

	private async Task<bool> SendDeadConnectionsAsync(List<UserIdentifierConnectionId> connections)
	{
		var deadConnections = connections
			.Select(x => new DeadConnectionDTO
			{
				UserIdentifierConnectionId = x.Id,
				FolderIds = x.FolderConnections?.Select(x => x.FolderId).ToList(),
				NoteIds = x.NoteConnections?.Select(x => x.NoteId).ToList(),
				UserId = x.UserId
			}).ToList();

		try
		{
			await daprClient.InvokeMethodAsync(HttpMethod.Post, daprConfig.Value.ApiName, "api/WSManagement/connections", deadConnections);

			return true;
		}
		catch (InvocationException ex)
		{
			logger.LogError(ex.ToString());
			// Handle error
		}
		catch (Exception ex)
		{
			logger.LogError(ex.ToString());
			// Handle error
		}

		return false;
	}
}