#include "file_handling.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void Ufile_handling::DeserializePlaneConfig(const FString &FilePath, FString &PlaneName, FString &PlaneModelPath, TMap<FString, FTeleportZone> &TeleportZones, TMap<FString, FSwitch> &Switches, ReadFileOutcome &OutputPins)
{
    FString LoadedString;

    // Attempt to load the file content into a string.
    if (!FFileHelper::LoadFileToString(LoadedString, *FilePath))
    {
        OutputPins = ReadFileOutcome::Failure;
        return;
    }

    TSharedPtr<FJsonObject> RootObject;
    TSharedRef<TJsonReader<>> JsonReader = TJsonReaderFactory<>::Create(LoadedString);

    if (!FJsonSerializer::Deserialize(JsonReader, RootObject) || !RootObject.IsValid())
    {
        OutputPins = ReadFileOutcome::Failure;
        return;
    }

    // Extract planeName and modelPath from the top-level JSON.
    if (RootObject->HasTypedField<EJson::String>(TEXT("planeName")))
    {
        PlaneName = RootObject->GetStringField(TEXT("planeName"));
    }

    if (RootObject->HasTypedField<EJson::String>(TEXT("modelPath")))
    {
        PlaneModelPath = RootObject->GetStringField(TEXT("modelPath"));
    }

    const TSharedPtr<FJsonObject> *TeleportZonesObject = nullptr;
    if (RootObject->TryGetObjectField(TEXT("TeleportZones"), TeleportZonesObject))
    {
        const TSharedPtr<FJsonObject> TeleportZonesJson = RootObject->GetObjectField(TEXT("TeleportZones"));

        for (const auto &TeleportZonePair : TeleportZonesJson->Values)
        {
            TSharedPtr<FJsonObject> TeleportZoneJson = TeleportZonePair.Value->AsObject();
            if (!TeleportZoneJson.IsValid())
            {
                continue;
            }

            FTeleportZone NewTeleportZone;

            if (TeleportZoneJson->HasTypedField<EJson::Object>(TEXT("dimensions")))
            {
                const TSharedPtr<FJsonObject> DimensionsJson = TeleportZoneJson->GetObjectField(TEXT("dimensions"));

                if (DimensionsJson->HasField(TEXT("X")) && DimensionsJson->HasField(TEXT("Y")) && DimensionsJson->HasField(TEXT("Z")))
                {
                    NewTeleportZone.Dimension.X = DimensionsJson->GetNumberField(TEXT("X"));
                    NewTeleportZone.Dimension.Y = DimensionsJson->GetNumberField(TEXT("Y"));
                    NewTeleportZone.Dimension.Z = DimensionsJson->GetNumberField(TEXT("Z"));
                }
            }

            if (TeleportZoneJson->HasTypedField<EJson::Object>(TEXT("position")))
            {
                const TSharedPtr<FJsonObject> PositionJson = TeleportZoneJson->GetObjectField(TEXT("position"));

                if (PositionJson->HasField(TEXT("X")) && PositionJson->HasField(TEXT("Y")) && PositionJson->HasField(TEXT("Z")))
                {
                    NewTeleportZone.Position.X = PositionJson->GetNumberField(TEXT("X"));
                    NewTeleportZone.Position.Y = PositionJson->GetNumberField(TEXT("Y"));
                    NewTeleportZone.Position.Z = PositionJson->GetNumberField(TEXT("Z"));
                }
            }

            TeleportZones.Add(TeleportZonePair.Key, NewTeleportZone);
        }
    }

    const TSharedPtr<FJsonObject> *SwitchesObject = nullptr;
    if (RootObject->TryGetObjectField(TEXT("switches"), SwitchesObject))
    {
        // Iterate over each switch entry.
        for (const auto &SwitchPair : (*SwitchesObject)->Values)
        {
            // Each value should be an object describing a switch.
            TSharedPtr<FJsonObject> SwitchJson = SwitchPair.Value->AsObject();
            if (!SwitchJson.IsValid())
            {
                continue;
            }

            FSwitch NewSwitch;

                      if (SwitchJson->HasTypedField<EJson::String>(TEXT("switchType")))
            {
                NewSwitch.SwitchType = SwitchJson->GetStringField(TEXT("switchType"));
            }
            if (SwitchJson->HasTypedField<EJson::String>(TEXT("switchDescription")))
            {
                NewSwitch.SwitchDescription = SwitchJson->GetStringField(TEXT("switchDescription"));
            }
            if (SwitchJson->HasTypedField<EJson::String>(TEXT("movementAxis")))
            {
                NewSwitch.MovementAxis = SwitchJson->GetStringField(TEXT("movementAxis"));
            }
            if (SwitchJson->HasTypedField<EJson::String>(TEXT("soundEffect")))
            {
                NewSwitch.SoundEffect = SwitchJson->GetStringField(TEXT("soundEffect"));
            }
            if (SwitchJson->HasTypedField<EJson::String>(TEXT("rawNodeName")))
            {
                NewSwitch.RawNodeName = SwitchJson->GetStringField(TEXT("rawNodeName"));
            }
            if (SwitchJson->HasTypedField<EJson::Boolean>(TEXT("movementMode")))
            {
                NewSwitch.bMovementMode = SwitchJson->GetBoolField(TEXT("movementMode"));
            }
            if (SwitchJson->HasTypedField<EJson::Boolean>(TEXT("momentarySwitch")))
            {
                NewSwitch.bMomentarySwitch = SwitchJson->GetBoolField(TEXT("momentarySwitch"));
            }
            if (SwitchJson->HasTypedField<EJson::Number>(TEXT("bleedMargins")))
            {
                NewSwitch.BleedMargins = SwitchJson->GetNumberField(TEXT("bleedMargins"));
            }
            if (SwitchJson->HasTypedField<EJson::Number>(TEXT("defaultPosition")))
            {
                NewSwitch.DefaultPosition = SwitchJson->GetNumberField(TEXT("defaultPosition"));
            }
            if (SwitchJson->HasTypedField<EJson::Number>(TEXT("upperLimit")))
            {
                NewSwitch.UpperLimit = SwitchJson->GetNumberField(TEXT("upperLimit"));
            }
            if (SwitchJson->HasTypedField<EJson::Number>(TEXT("lowerLimit")))
            {
                NewSwitch.LowerLimit = SwitchJson->GetNumberField(TEXT("lowerLimit"));
            }

            // Add the populated switch to the output array.
            Switches.Add(SwitchPair.Key, NewSwitch);
        }
    }

    OutputPins = ReadFileOutcome::Success;
}