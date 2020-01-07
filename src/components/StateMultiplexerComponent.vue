<template>
    <v-window v-model="currentState">
        <v-window-item v-for="validState of validStates" :key="validState" :value="validState">
            <slot :name="validState"/>
        </v-window-item>
    </v-window>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class StateMultiplexerComponent extends Vue {

        @Prop({required: true})
        readonly validStates!: string[];

        @Prop({required: true})
        readonly state!: string;

        currentState: string | null = null;

        @Watch("validStates", {immediate: true})
        onValidStates() {
            this.setState();
        }

        @Watch("state", {immediate: true})
        onState() {
            this.setState();
        }

        setState(state: string = this.state) {
            if (this.validStates.includes(state))
                this.currentState = state;
        }

    }
</script>
