using Billing.Entities;
using Billing.Impl;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Billing.Api;

[Route("api/[controller]")]
[ApiController]
public class BillingController : ControllerBase
{
    private readonly IMediator mediator;
    private readonly BillingPermissionService billingPermissionService;

    public BillingController(IMediator mediator, BillingPermissionService billingPermissionService)
    {
        this.mediator = mediator;
        this.billingPermissionService = billingPermissionService;
    }

    [HttpGet]
    public async Task<List<BillingPlanDTO>> GetPlansAsync()
    {
        return await billingPermissionService.GetPlansAsync();
    }
}