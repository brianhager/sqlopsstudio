/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./formLayout';

import {
	Component, Input, Inject, ChangeDetectorRef, forwardRef, ComponentFactoryResolver,
	ViewChild, ViewChildren, ElementRef, Injector, OnDestroy, QueryList, AfterViewInit
} from '@angular/core';

import { IComponent, IComponentDescriptor, IModelStore, ComponentEventType } from 'sql/parts/modelComponents/interfaces';
import { FormLayout, FormItemLayout } from 'sqlops';

import { DashboardServiceInterface } from 'sql/parts/dashboard/services/dashboardServiceInterface.service';
import { ContainerBase } from 'sql/parts/modelComponents/componentBase';
import { ModelComponentWrapper } from 'sql/parts/modelComponents/modelComponentWrapper.component';
import { CommonServiceInterface } from 'sql/services/common/commonServiceInterface.service';

export interface TitledFormItemLayout {
	title: string;
	actions?: string[];
	isFormComponent: Boolean;
}
class FormItem {
	constructor(public descriptor: IComponentDescriptor, public config: TitledFormItemLayout) { }
}

@Component({
	template: `
		<div #container *ngIf="items" class="form-table"
				[style.alignItems]="alignItems" [style.alignContent]="alignContent">
			<div *ngFor="let item of items" class="form-row">
				<ng-container *ngIf="isFormComponent(item)">
					<div class="form-cell">{{getItemTitle(item)}}</div>
					<div class="form-cell">
						<model-component-wrapper [descriptor]="item.descriptor" [modelStore]="modelStore">
						</model-component-wrapper>
					</div>
					<div *ngIf="itemHasActions(item)" class="form-cell">
						<div *ngFor="let actionItem of getActionComponents(item)" >
							<model-component-wrapper  [descriptor]="actionItem.descriptor" [modelStore]="modelStore">
							</model-component-wrapper>
						</div>
					</div>
				</ng-container>
			</div>
		</div>
	`
})
export default class FormContainer extends ContainerBase<FormItemLayout> implements IComponent, OnDestroy, AfterViewInit {
	@Input() descriptor: IComponentDescriptor;
	@Input() modelStore: IModelStore;

	private _alignItems: string;
	private _alignContent: string;

	@ViewChildren(ModelComponentWrapper) private _componentWrappers: QueryList<ModelComponentWrapper>;
	@ViewChild('container', { read: ElementRef }) private _container: ElementRef;

	constructor (
			@Inject(forwardRef(() => CommonServiceInterface)) private _commonService: CommonServiceInterface,
		 	@Inject(forwardRef(() => ChangeDetectorRef)) changeRef: ChangeDetectorRef) {
		super(changeRef);
	}

	ngOnInit(): void {
		this.baseInit();
	}

	ngOnDestroy(): void {
		this.baseDestroy();
	}

	ngAfterViewInit(): void {
	}

	/// IComponent implementation

	public layout(): void {
		if (this._componentWrappers) {
			this._componentWrappers.forEach(wrapper => {
				wrapper.layout();
			});
		}
	}

	public get alignItems(): string {
		return this._alignItems;
	}

	public get alignContent(): string {
		return this._alignContent;
	}

	private getItemTitle(item: FormItem): string {
		let itemConfig = item.config;
		return itemConfig ? itemConfig.title : '';
	}

	private getActionComponents(item: FormItem): FormItem[]{
		let items = this.items;
		let itemConfig = item.config;
		if (itemConfig && itemConfig.actions) {
			let resultItems = itemConfig.actions.map(x => {
				let actionComponent = items.find(i => i.descriptor.id === x);
				return <FormItem>actionComponent;
			});

			return resultItems.filter(r => r && r.descriptor);
		}

		return [];
	}

	private isFormComponent(item: FormItem): Boolean {
		return item && item.config && item.config.isFormComponent;
	}

	private itemHasActions(item: FormItem): Boolean {
		let itemConfig = item.config;
		return itemConfig && itemConfig.actions !== undefined && itemConfig.actions.length > 0;
	}

	public setLayout(layout: any): void {
		this.layout();
	}
}
