/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Component, Input, ContentChild, OnDestroy, TemplateRef } from '@angular/core';

import { Action } from 'vs/base/common/actions';

export abstract class TabChild {
	public abstract layout(): void;
}

export interface TabChild {
	init?(): void;
}

@Component({
	selector: 'tab',
	template: `
		<div class="visibility" [class.hidden]="!active && visibilityType == 'visibility'" *ngIf="visibilityType == 'visibility' || active" class="fullsize">
			<ng-container *ngTemplateOutlet="templateRef"></ng-container>
		</div>
	`
})
export class TabComponent implements OnDestroy {
	@ContentChild(TabChild) private _child: TabChild;
	@Input() public title: string;
	@Input() public canClose: boolean;
	@Input() public actions: Array<Action>;
	@Input() public iconClass: string;
	public _active = false;
	@Input() public identifier: string;
	@Input() private visibilityType: 'if' | 'visibility' = 'if';
	@ContentChild(TemplateRef) templateRef;
	private init = false;

	public set active(val: boolean) {
		this._active = val;
		if (this.active && this._child) {
			if (!this.init) {
				this._child.init();
			}
			this._child.layout();
		}
	}

	public get active(): boolean {
		return this._active;
	}

	ngOnDestroy() {
		if (this.actions && this.actions.length > 0) {
			this.actions.forEach((action) => action.dispose());
		}
	}

	layout() {
		if (this._child) {
			this._child.layout();
		}
	}
}
