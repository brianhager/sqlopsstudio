/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Event from 'vs/base/common/event';

import { AngularDisposable } from 'sql/base/common/lifecycle';
import { TabChild } from 'sql/base/browser/ui/panel/tab.component';

export enum Conditional {
	'equals',
	'notEquals',
	'greaterThanOrEquals',
	'greaterThan',
	'lessThanOrEquals',
	'lessThan',
	'always'
}

export abstract class DashboardTab extends AngularDisposable implements TabChild {
	public abstract layout(): void;
	public abstract readonly id: string;
	public abstract readonly editable: boolean;
	public abstract refresh(): void;
	public abstract readonly onResize: Event<void>;
	public abstract init(): void;
	public enableEdit(): void {
		// no op
	}
}
