using API.Worker.Models.Config;
using Common;
using Common.DatabaseModels.Models.WS;
using Common.DTO.WebSockets;
using Dapr.Client;
using DatabaseContext.Repositories.WS;

namespace API.Worker.BI;

public class RemoveDeadWSConnectionsHandler
{
	private readonly UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository;
	private readonly JobsTimerConfig jobsTimerConfig;
	private readonly IConfiguration configuration;
	private readonly HttpClient httpClient;
	private readonly DaprClient _daprClient;
	private readonly ILogger<RemoveDeadWSConnectionsHandler> logger;

	public RemoveDeadWSConnectionsHandler(
		UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository,
		JobsTimerConfig jobsTimerConfig,
		IConfiguration configuration,
		HttpClient httpClient,
		DaprClient daprClient,
		ILogger<RemoveDeadWSConnectionsHandler> logger)
	{
		this.userIdentifierConnectionIdRepository = userIdentifierConnectionIdRepository;
		this.jobsTimerConfig = jobsTimerConfig;
		this.configuration = configuration;
		this.httpClient = httpClient;
		_daprClient = daprClient;
		this.logger = logger;
	}

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
		var nootsAPI = configuration.GetSection("NootsAPI").Value;

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
			await _daprClient.InvokeMethodAsync(HttpMethod.Post, nootsAPI, "api/WSManagement/connections", deadConnections);

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