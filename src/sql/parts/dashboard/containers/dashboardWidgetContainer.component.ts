/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./dashboardWidgetContainer';

import { Component, Inject, Input, forwardRef, ViewChild, ViewChildren, QueryList, OnDestroy, ChangeDetectorRef, EventEmitter, OnChanges, AfterContentInit } from '@angular/core';
import { NgGridConfig, NgGrid, NgGridItem } from 'angular2-grid';

import { DashboardServiceInterface } from 'sql/parts/dashboard/services/dashboardServiceInterface.service';
import { TabConfig, WidgetConfig } from 'sql/parts/dashboard/common/dashboardWidget';
import { DashboardWidgetWrapper } from 'sql/parts/dashboard/contents/dashboardWidgetWrapper.component';
import { subscriptionToDisposable } from 'sql/base/common/lifecycle';
import { DashboardTab } from 'sql/parts/dashboard/common/interfaces';
import { WidgetContent } from 'sql/parts/dashboard/contents/widgetContent.component';
import { TabChild } from 'sql/base/browser/ui/panel/tab.component';

import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { ConfigurationTarget } from 'vs/platform/configuration/common/configuration';
import * as objects from 'vs/base/common/objects';
import Event, { Emitter } from 'vs/base/common/event';

@Component({
	selector: 'dashboard-widget-container',
	providers: [{ provide: TabChild, useExisting: forwardRef(() => DashboardWidgetContainer) }],
	template: `
		<widget-content [widgets]="widgets" [originalConfig]="tab.originalConfig" [context]="tab.context">
		</widget-content>
	`
})
export class DashboardWidgetContainer extends DashboardTab implements OnDestroy, OnChanges, AfterContentInit {
	@Input() private tab: TabConfig;
	private widgets: WidgetConfig[];
	private _onResize = new Emitter<void>();
	public readonly onResize: Event<void> = this._onResize.event;
	private initted = false;
	private ngOnInitted = false;

	@ViewChild(WidgetContent) protected _widgetContent: WidgetContent;

	constructor(
		@Inject(forwardRef(() => ChangeDetectorRef)) protected _cd: ChangeDetectorRef
	) {
		super();
	}

	init() {
		this.initted = true;
		if (this.ngOnInitted && this.tab.container) {
			this.widgets = Object.values(this.tab.container)[0];
		}
	}

	ngOnInit() {
		this.ngOnInitted = true;
	}

	ngOnChanges() {
		if (this.initted && this.tab.container) {
			this.widgets = Object.values(this.tab.container)[0];
			this._cd.detectChanges();
		}
	}

	ngAfterContentInit(): void {
		this._register(this._widgetContent.onResize(() => {
			this._onResize.fire();
		}));
	}

	ngOnDestroy() {
		this.dispose();
	}

	public get id(): string {
		return this.tab.id;
	}

	public get editable(): boolean {
		return this.tab.editable;
	}

	public layout() {
		this._widgetContent.layout();
	}

	public refresh(): void {
		this._widgetContent.refresh();
	}

	public enableEdit(): void {
		this._widgetContent.enableEdit();
	}
}
