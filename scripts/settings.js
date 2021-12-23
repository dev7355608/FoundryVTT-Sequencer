import SequencerEffectsUI from "./module/formapplications/sequencer-effects-ui.js";
import CONSTANTS from "./module/constants.js";
import { user_can_do } from "./module/lib/lib.js";
import { EffectPlayer, SelectionManager } from "./module/sequencer-interaction-manager.js";

export function registerSettings() {

    // Define a settings submenu which handles advanced configuration needs
    game.settings.registerMenu(CONSTANTS.MODULE_NAME, "openSequencerDatabaseViewer", {
        name: "SEQUENCER.Setting.DatabaseViewer.Title",
        label: "SEQUENCER.Setting.DatabaseViewer.Label",
        icon: "fas fa-bars",
        type: Sequencer.DatabaseViewer,
        restricted: true
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "debug", {
        name: "SEQUENCER.Setting.Debug.Title",
        hint: "SEQUENCER.Setting.Debug.Label",
        scope: "client",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "effectsEnabled", {
        name: "SEQUENCER.Setting.EnableEffects.Title",
        hint: "SEQUENCER.Setting.EnableEffects.Label",
        scope: "client",
        config: true,
        default: true,
        onChange: debouncedReload,
        type: Boolean
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "soundsEnabled", {
        name: "SEQUENCER.Setting.EnableSounds.Title",
        hint: "SEQUENCER.Setting.EnableSounds.Label",
        scope: "client",
        config: true,
        default: true,
        onChange: debouncedReload,
        type: Boolean
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "user-effect-opacity", {
        name: "SEQUENCER.Setting.ExternalEffectOpacity.Title",
        hint: "SEQUENCER.Setting.ExternalEffectOpacity.Label",
        scope: "client",
        config: true,
        default: 50,
        type: Number,
        range: {
            min: 0,
            max: 100,
            step: 1
        }
    });

    const permissionLevels = [
        game.i18n.localize("SEQUENCER.Permission.Player"),
        game.i18n.localize("SEQUENCER.Permission.Trusted"),
        game.i18n.localize("SEQUENCER.Permission.Assistant"),
        game.i18n.localize("SEQUENCER.Permission.GM")
    ];

    game.settings.register(CONSTANTS.MODULE_NAME, "permissions-effect-create", {
        name: "SEQUENCER.Setting.Permission.EffectCreate.Title",
        hint: "SEQUENCER.Setting.Permission.EffectCreate.Label",
        scope: "world",
        config: true,
        default: 0,
        type: Number,
        choices: permissionLevels,
        onChange: debouncedReload
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "permissions-effect-delete", {
        name: "SEQUENCER.Setting.Permission.EffectDelete.Title",
        hint: "SEQUENCER.Setting.Permission.EffectDelete.Label",
        scope: "world",
        config: true,
        default: 2,
        type: Number,
        choices: permissionLevels,
        onChange: debouncedReload
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "permissions-sound-create", {
        name: "SEQUENCER.Setting.Permission.SoundCreate.Title",
        hint: "SEQUENCER.Setting.Permission.SoundCreate.Label",
        scope: "world",
        config: true,
        default: 0,
        type: Number,
        choices: permissionLevels,
        onChange: debouncedReload
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "permissions-_preload", {
        name: "SEQUENCER.Setting.Permission.PreloadClients.Title",
        hint: "SEQUENCER.Setting.Permission.PreloadClients.Label",
        scope: "world",
        config: true,
        default: 1,
        type: Number,
        choices: permissionLevels,
        onChange: debouncedReload
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "permissions-sidebar-tools", {
        name: "SEQUENCER.Setting.Permission.UseSidebarTools.Title",
        hint: "SEQUENCER.Setting.Permission.UseSidebarTools.Label",
        scope: "world",
        config: true,
        default: 0,
        type: Number,
        choices: permissionLevels,
        onChange: debouncedReload
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "hyperspace-deprecation-warning", {
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "effect-tools-permissions-tools-warning", {
        scope: "client",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.register(CONSTANTS.MODULE_NAME, "effectPresets", {
        scope: "client",
        default: {},
        type: Object
    });

    Hooks.on("getSceneControlButtons", (controls) => {

        const selectTool = {
            icon: "fas fa-expand",
            name: "select-effect",
            title: "Select Effect",
            visible: user_can_do("permissions-effect-create") && user_can_do('permissions-sidebar-tools'),
        };

        const playTool = {
            icon: "fas fa-play",
            name: "play-effect",
            title: "Play Effect",
            visible: user_can_do("permissions-effect-create") && user_can_do('permissions-sidebar-tools'),
            onClick: () => {
                SequencerEffectsUI.show({ inFocus: true, tab: "player" });
            }
        };

        const viewer = {
            icon: "fas fa-film",
            name: "effectviewer",
            title: "Show Sequencer Effects Viewer",
            button: true,
            visible: user_can_do("permissions-effect-create") && user_can_do('permissions-sidebar-tools'),
            onClick: () => {
                SequencerEffectsUI.show({ inFocus: true, tab: "manager" });
            }
        };

        const database = {
            icon: "fas fa-database",
            name: "effectdatabase",
            title: "Show Sequencer Database",
            button: true,
            visible: user_can_do('permissions-sidebar-tools'),
            onClick: () => {
                Sequencer.DatabaseViewer.show(true);
            }
        };

        controls.push({
            name: CONSTANTS.MODULE_NAME,
            title: "Sequencer Layer",
            icon: "fas fa-list-ol",
            layer: "sequencerEffectsAboveTokens",
            visible: user_can_do("permissions-effect-create") && user_can_do("permissions-sidebar-tools"),
            activeTool: "select-effect",
            tools: [
                selectTool,
                playTool,
                viewer,
                database
            ]
        })

        const bar = controls.find(c => c.name === "token");
        bar.tools.push(database);
        bar.tools.push(viewer);

    });

    console.log("Sequencer | Registered settings");

}

export function registerHotkeys() {

    game.keybindings.register(CONSTANTS.MODULE_NAME, "play-tool-hotkey-shift", {
        name: "SEQUENCER.Hotkeys.PlayTool.Shift",
        uneditable: [
            { key: "ShiftLeft" },
        ],
        onDown: () => {
            EffectPlayer.playMany = true;
        },
        onUp: () => {
            EffectPlayer.playMany = false;
            if(!EffectPlayer.isActive) return;
            EffectPlayer.shiftUp();
        },
        reservedModifiers: ["CONTROL"]
    });

    game.keybindings.register(CONSTANTS.MODULE_NAME, "play-tool-hotkey-control", {
        name: "SEQUENCER.Hotkeys.PlayTool.Control",
        uneditable: [
            { key: "ControlLeft" },
        ],
        onDown: () => {
            EffectPlayer.playManySequenced = true;
        },
        onUp: () => {
            EffectPlayer.playManySequenced = false;
        },
        reservedModifiers: ["SHIFT"]
    });

    game.keybindings.register(CONSTANTS.MODULE_NAME, "select-tool-hotkey-control", {
        name: "SEQUENCER.Hotkeys.SelectTool.Control",
        uneditable: [
            { key: "ControlLeft" },
        ],
        onDown: () => {
            SelectionManager.snapToGrid = true;
        },
        onUp: () => {
            SelectionManager.snapToGrid = false;
        },
        reservedModifiers: ["SHIFT", "ALT"]
    });

    game.keybindings.register(CONSTANTS.MODULE_NAME, "select-tool-hotkey-alt", {
        name: "SEQUENCER.Hotkeys.SelectTool.Alt",
        uneditable: [
            { key: "AltLeft" },
        ],
        onDown: () => {
            SelectionManager.attachToTarget = true;
            if(!SelectionManager.isActive) return;
            SelectionManager.altDown()
        },
        onUp: () => {
            SelectionManager.attachToTarget = false;
        },
        reservedModifiers: ["CONTROL", "SHIFT"]
    });

    game.keybindings.register(CONSTANTS.MODULE_NAME, "select-tool-hotkey-delete", {
        name: "SEQUENCER.Hotkeys.SelectTool.Delete",
        uneditable: [
            { key: "Delete" },
        ],
        onDown: () => {
            SelectionManager.delete();
        },
    });


}

const debouncedReload = debounce(() => {
    window.location.reload()
}, 100)