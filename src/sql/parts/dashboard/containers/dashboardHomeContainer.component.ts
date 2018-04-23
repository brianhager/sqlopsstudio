/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./dashboardHomeContainer';

import { Component, forwardRef, Input, ChangeDetectorRef, Inject, ViewChild } from '@angular/core';

import { DashboardWidgetContainer } from 'sql/parts/dashboard/containers/dashboardWidgetContainer.component';
import { DashboardTab } from 'sql/parts/dashboard/common/interfaces';
import { WidgetConfig } from 'sql/parts/dashboard/common/dashboardWidget';
import { DashboardServiceInterface } from 'sql/parts/dashboard/services/dashboardServiceInterface.service';
import { CommonServiceInterface } from 'sql/services/common/commonServiceInterface.service';
import { AngularEventType } from 'sql/services/angularEventing/angularEventingService';
import { TabChild } from 'sql/base/browser/ui/panel/tab.component';
import { DashboardWidgetWrapper } from 'sql/parts/dashboard/contents/dashboardWidgetWrapper.component';

import { ConfigurationTarget } from 'vs/platform/configuration/common/configuration';

@Component({
	selector: 'dashboard-home-container',
	providers: [{ provide: TabChild, useExisting: forwardRef(() => DashboardHomeContainer) }],
	template: `
		<dashboard-widget-wrapper #propertiesClass *ngIf="properties" [collapsable]="true" [_config]="properties"
			style="padding-left: 10px; padding-right: 10px; display: block" [style.height.px]="_propertiesClass?.collapsed ? '30' : '90'">
		</dashboard-widget-wrapper>
		<widget-content [widgets]="widgets" [originalConfig]="tab.originalConfig" [context]="tab.context">
		</widget-content>
	`
})
export class DashboardHomeContainer extends DashboardWidgetContainer {
	@Input() private properties: WidgetConfig;
	@ViewChild('propertiesClass') private _propertiesClass: DashboardWidgetWrapper;

	private dashboardService: DashboardServiceInterface;

	constructor(
		@Inject(forwardRef(() => ChangeDetectorRef)) _cd: ChangeDetectorRef,
		@Inject(forwardRef(() => CommonServiceInterface)) protected commonService: CommonServiceInterface,

	) {
		super(_cd);
		this.dashboardService = commonService as DashboardServiceInterface;
	}

	ngAfterContentInit() {
		let collapsedVal = this.dashboardService.getSettings<string>(`${this.properties.context}.properties`);
		if (collapsedVal === 'collapsed') {
			this._propertiesClass.collapsed = true;
		}
		this.dashboardService.angularEventingService.onAngularEvent(this.dashboardService.getUnderlyingUri(), event => {
			if (event.event === AngularEventType.COLLAPSE_WIDGET && this._propertiesClass && event.payload === this._propertiesClass.guid) {
				this._propertiesClass.collapsed = !this._propertiesClass.collapsed;
				this._cd.detectChanges();
				this.dashboardService.configurationEditingService.writeConfiguration(ConfigurationTarget.USER, {
					key: `dashboard.${this.properties.context}.properties`,
					value: this._propertiesClass.collapsed ? 'collapsed' : true
				});
			}
		});
	}
}
