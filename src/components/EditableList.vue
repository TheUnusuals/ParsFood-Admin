<template>
    <validated-v-card :error-messages="errorMessages" outlined>
        <template v-if="title">
            <v-card-title class="pa-2">{{title}}:</v-card-title>
            <v-divider/>
        </template>
        <v-list class="pa-0 overflow-y-auto" :style="{'max-height': maxContentHeight}" dense>
            <v-card-text v-if="items.length === 0" class="pa-2">
                {{emptyText || $t('components.editable-list.empty')}}
            </v-card-text>
            <div v-for="(item, i) of items" :key="keys[i]">
                <v-divider v-if="i !== 0"/>
                <v-list-item class="px-2"
                             :class="{[restoreClass]: deletedCache.get(keys[i])}"
                             v-if="deletedCache.get(keys[i]) && restoreMessage"
                             dense>
                    <v-list-item-content>
                        <v-alert type="warning" class="ma-0 mt-2" border="left" dense>
                            {{restoreMessage}}
                        </v-alert>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item class="px-2 pt-2" :class="{[restoreClass]: deletedCache.get(keys[i])}" dense>
                    <v-list-item-action v-if="canOrder && items.length > 1" class="mr-1">
                        <div class="d-flex flex-column">
                            <v-btn :title="removeText || $t('components.editable-list.move-up')"
                                   v-if="i !== 0"
                                   @click="moveItem(i, i - 1)"
                                   small
                                   icon>
                                <v-icon>mdi-chevron-up</v-icon>
                            </v-btn>
                            <v-btn :title="removeText || $t('components.editable-list.move-down')"
                                   v-if="i < items.length - 1"
                                   @click="moveItem(i, i + 1)"
                                   small
                                   icon>
                                <v-icon>mdi-chevron-down</v-icon>
                            </v-btn>
                        </div>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-row style="max-width:100%" dense>
                            <v-col :style="{'min-width': contentMinWidth}">
                                <slot :item="item"
                                      :index="i"
                                      :item-key="keys[i]"
                                      :deleted="deletedCache.get(keys[i])"/>
                            </v-col>
                            <v-col class="flex-grow-0"
                                   :style="{'min-width': appendMinWidth}"
                                   v-if="$scopedSlots['append']">
                                <slot name="append"
                                      :item="item"
                                      :index="i"
                                      :item-key="keys[i]"
                                      :deleted="deletedCache.get(keys[i])"/>
                            </v-col>
                        </v-row>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-btn color="error"
                               :title="removeText || $t('components.editable-list.remove')"
                               @click="removeItem(i, keys[i])"
                               v-if="!deletedCache.get(keys[i])"
                               icon>
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-btn color="warning"
                               :title="restoreText || $t('components.editable-list.restore')"
                               @click="restoreItem(keys[i])"
                               v-if="deletedCache.get(keys[i])"
                               icon>
                            <v-icon>mdi-restore</v-icon>
                        </v-btn>
                    </v-list-item-action>
                </v-list-item>
            </div>
        </v-list>
        <template v-if="$scopedSlots.footer">
            <v-divider/>
            <v-card-text class="pa-2">
                <slot name="footer"/>
            </v-card-text>
        </template>
        <template v-if="add">
            <v-divider/>
            <v-card-actions>
                <v-btn color="primary" @click="addItem()">
                    {{addText || $t('components.editable-list.add')}}
                </v-btn>
            </v-card-actions>
        </template>
    </validated-v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Model, Prop, Watch} from "vue-property-decorator";
    import ValidatedVCard from "@/components/ValidatedVCard.vue";
    import isEqual from "lodash/isEqual";

    const modelEvent = "change";

    @Component({
        components: {ValidatedVCard}
    })
    export default class EditableList extends Vue {

        deletedCacheMap: Map<any, boolean> = new Map();
        deletedCacheUpdater: boolean = false;

        @Model(modelEvent, {required: true}) readonly items!: any[];
        @Prop() readonly add?: () => any;

        @Prop() readonly errorMessages?: string[];

        @Prop() readonly title?: string;
        @Prop({type: [String, Function]}) readonly itemKey?: string | ((item: any, index: number) => any);

        @Prop() readonly addText?: string;
        @Prop() readonly emptyText?: string;

        @Prop() readonly removeText?: string;
        @Prop() readonly restoreText?: string;
        @Prop() readonly moveUpText?: string;
        @Prop() readonly moveDownText?: string;

        @Prop() readonly restoreMessage?: string;

        @Prop({default: () => false}) readonly canOrder!: boolean;
        @Prop({default: () => false}) readonly markDeleted!: boolean;
        @Prop() readonly markDeletedFilter?: (item: any, index: number, key: any) => boolean;

        @Prop({default: () => "fit-content"}) readonly contentMinWidth!: string;
        @Prop({default: () => "fit-content"}) readonly appendMinWidth!: string;
        @Prop({default: () => "500px"}) readonly maxContentHeight!: string;

        @Prop({default: () => "warning lighten-5"}) readonly restoreClass!: string;

        @Prop({default: () => []}) readonly deletedItems!: any[];

        get deletedCache() {
            return this.deletedCacheUpdater ? this.deletedCacheMap : this.deletedCacheMap;
        }

        get keys(): any[] {
            return this.items.map((item, index) => this.getKey(item, index));
        }

        @Watch("keys", {immediate: true})
        onKeys(keys: any[]) {
            const newDeletedCache: Map<any, boolean> = new Map();

            for (let key of keys) {
                if (this.deletedCache.has(key)) {
                    newDeletedCache.set(key, this.deletedCache.get(key) as any);
                } else {
                    newDeletedCache.set(key, false);
                }
            }

            this.deletedCacheMap = newDeletedCache;
            this.markDeletedCacheForUpdate();

            this.updateDeletedItems();
        }

        @Watch("deletedCache")
        onDeletedCache() {
            this.updateDeletedItems();
        }

        @Watch("deletedItems", {immediate: true})
        onDeletedItems(newDeletedItems: any[]) {
            const mappedItems = newDeletedItems.map(newDeletedItem => ({
                item: newDeletedItem,
                index: this.items.findIndex(item => item === newDeletedItem)
            })).filter(mappedItem => mappedItem.index >= 0);

            let needsUpdate = false;
            for (let mappedItem of mappedItems) {
                const key = this.getKey(mappedItem.item, mappedItem.index);

                if (this.deletedCache.get(key) !== true) {
                    this.deletedCache.set(key, true);
                    needsUpdate = true;
                }
            }

            if (needsUpdate) this.markDeletedCacheForUpdate();
        }

        updateDeletedItems() {
            const newDeletedItems = [...this.deletedCache]
                .map(([key, deleted], index) => ({deleted, index}))
                .filter(({deleted}) => deleted)
                .map(({index}) => this.items[index]);

            if (!isEqual(this.deletedItems, newDeletedItems)) this.$emit("update:deletedItems", newDeletedItems);
        }

        markDeletedCacheForUpdate() {
            this.deletedCacheUpdater = !this.deletedCacheUpdater;
        }

        getKey(item: any, index: number): any {
            return this.itemKey ? (typeof this.itemKey === "string" ? item[this.itemKey] : this.itemKey(item, index)) : index;
        }

        addItem() {
            if (this.add) {
                const items = this.items.map(item => item);
                items.push(this.add());
                this.$emit(modelEvent, items);
            }
        }

        moveItem(index: number, targetIndex: number) {
            const items = this.items.map(item => item);
            const [item] = items.splice(index, 1);
            items.splice(targetIndex, 0, item);
            this.$emit(modelEvent, items);
        }

        removeItem(index: number, key: any) {
            if (this.markDeleted && (!this.markDeletedFilter || this.markDeletedFilter(this.items[index], index, key))) {
                this.deletedCache.set(key, true);
                this.markDeletedCacheForUpdate();
            } else {
                const items = this.items.map(item => item);
                items.splice(index, 1);
                this.$emit(modelEvent, items);
            }
        }

        restoreItem(key: any) {
            this.deletedCache.set(key, false);
            this.markDeletedCacheForUpdate();
        }

    }
</script>
