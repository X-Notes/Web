using Common;
using Common.DatabaseModels.Models.WS;
using Noots.DatabaseContext.Repositories.WS;
using System.Text;
using Newtonsoft.Json;
using Common.DTO.WebSockets;
using Noots.API.Workers.Models.Config;

namespace Noots.API.Workers.BI;

public class RemoveDeadWSConnectionsHandler
{
	private readonly UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository;
	private readonly JobsTimerConfig jobsTimerConfig;
	private readonly IConfiguration configuration;
	private readonly HttpClient httpClient;
	private readonly ILogger<RemoveDeadWSConnectionsHandler> logger;

	public RemoveDeadWSConnectionsHandler(
		UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository,
		JobsTimerConfig jobsTimerConfig,
		IConfiguration configuration,
		HttpClient httpClient,
		ILogger<RemoveDeadWSConnectionsHandler> logger)
	{
		this.userIdentifierConnectionIdRepository = userIdentifierConnectionIdRepository;
		this.jobsTimerConfig = jobsTimerConfig;
		this.configuration = configuration;
		this.httpClient = httpClient;
		this.logger = logger;
	}

	public async Task HandleAsync()
	{
		var earliestTimestamp = DateTimeProvider.Time.AddMinutes(-jobsTimerConfig.DeleteDeadConnectionsMinutes);
		var deadConnections = await userIdentifierConnectionIdRepository.GetConnectionsByDateIncludeNotesFoldersAsync(earliestTimestamp);
		if (deadConnections.Count > 0)
		{
			await SendDeadConnectionsAsync(deadConnections);
			await userIdentifierConnectionIdRepository.RemoveRangeAsync(deadConnections);
		}
	}

	private async Task SendDeadConnectionsAsync(List<UserIdentifierConnectionId> connections)
	{
		var nootsAPI = configuration.GetSection("NootsAPI").Value + "/api/WSManagement/connections";
		if (string.IsNullOrEmpty(nootsAPI))
		{
			throw new Exception("NootsAPI value cannot be NULL");
		}

		var deadConnections = connections
			.Select(x => new DeadConnectionDTO
			{
				UserIdentifierConnectionId = x.Id,
				FolderIds = x.FolderConnections?.Select(x => x.FolderId).ToList(),
				NoteIds = x.NoteConnections?.Select(x => x.NoteId).ToList(),
				UserId = x.UserId
			});

		var json = JsonConvert.SerializeObject(deadConnections);
		var content = new StringContent(json, Encoding.UTF8, "application/json");
		var resp = await httpClient.PostAsync(nootsAPI, content);

		if (!resp.IsSuccessStatusCode)
		{
			logger.LogError($"Code: {resp.StatusCode}, Reason: {resp.ReasonPhrase}");
		}
	}
}
