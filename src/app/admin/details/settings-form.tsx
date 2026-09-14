"use client";

import { useActionState } from "react";

import {
  saveWeddingSettings,
  type WeddingSettingsActionState,
} from "../actions";
import { adminStyles } from "../admin-styles";

export type WeddingSettingsFormValues = {
  partner_one_name: string;
  partner_two_name: string;
  wedding_date: string;
  timezone: string;
  ceremony_time: string;
  reception_time: string;
  venue_name: string;
  venue_address: string;
  dress_code: string;
  directions_url: string;
  hero_eyebrow: string;
  hero_message: string;
  story_heading: string;
  story_introduction: string;
  story_body: string;
  details_heading: string;
};

type Props = {
  settings: (WeddingSettingsFormValues & { is_published: boolean }) | null;
};

const initialState: WeddingSettingsActionState = {};

function inputDate(value?: string) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

export function WeddingSettingsForm({ settings }: Props) {
  const [state, formAction, isPending] = useActionState(
    saveWeddingSettings,
    initialState,
  );

  return (
    <form className={adminStyles.settingsForm} action={formAction}>
      <div className={adminStyles.formSection}>
        <p className={adminStyles.eyebrow}>The couple</p>
        <div className={adminStyles.formGrid}>
          <label>
            <span>Partner one</span>
            <input
              name="partner_one_name"
              defaultValue={settings?.partner_one_name}
              required
            />
          </label>
          <label>
            <span>Partner two</span>
            <input
              name="partner_two_name"
              defaultValue={settings?.partner_two_name}
              required
            />
          </label>
        </div>
      </div>

      <div className={adminStyles.formSection}>
        <p className={adminStyles.eyebrow}>When and where</p>
        <div className={adminStyles.formGrid}>
          <label>
            <span>Wedding date and time</span>
            <input
              name="wedding_date"
              type="datetime-local"
              defaultValue={inputDate(settings?.wedding_date)}
              required
            />
          </label>
          <label>
            <span>Timezone</span>
            <input
              name="timezone"
              defaultValue={settings?.timezone ?? "Africa/Lagos"}
              required
            />
          </label>
          <label>
            <span>Ceremony time</span>
            <input
              name="ceremony_time"
              defaultValue={settings?.ceremony_time}
              placeholder="2:00 PM"
              required
            />
          </label>
          <label>
            <span>Reception time</span>
            <input
              name="reception_time"
              defaultValue={settings?.reception_time}
              placeholder="5:00 PM"
              required
            />
          </label>
          <label>
            <span>Venue name</span>
            <input
              name="venue_name"
              defaultValue={settings?.venue_name}
              required
            />
          </label>
          <label>
            <span>Venue address</span>
            <input
              name="venue_address"
              defaultValue={settings?.venue_address}
              required
            />
          </label>
          <label>
            <span>Dress code</span>
            <input
              name="dress_code"
              defaultValue={settings?.dress_code}
              required
            />
          </label>
          <label>
            <span>Directions URL</span>
            <input
              name="directions_url"
              type="url"
              defaultValue={settings?.directions_url}
              required
            />
          </label>
        </div>
      </div>

      <div className={adminStyles.formSection}>
        <p className={adminStyles.eyebrow}>Public copy</p>
        <div className={`${adminStyles.formGrid} ${adminStyles.formGridWide}`}>
          <label>
            <span>Details heading</span>
            <input
              name="details_heading"
              defaultValue={settings?.details_heading ?? "Meet us in Lagos"}
              required
            />
          </label>
          <label>
            <span>Hero eyebrow</span>
            <input
              name="hero_eyebrow"
              defaultValue={settings?.hero_eyebrow}
              required
            />
          </label>
          <label>
            <span>Story heading</span>
            <input
              name="story_heading"
              defaultValue={settings?.story_heading}
              required
            />
          </label>
          <label className={adminStyles.fieldWide}>
            <span>Hero message</span>
            <textarea
              name="hero_message"
              defaultValue={settings?.hero_message}
              rows={3}
              required
            />
          </label>
          <label className={adminStyles.fieldWide}>
            <span>Story introduction</span>
            <textarea
              name="story_introduction"
              defaultValue={settings?.story_introduction}
              rows={4}
              required
            />
          </label>
          <label className={adminStyles.fieldWide}>
            <span>Story body</span>
            <textarea
              name="story_body"
              defaultValue={settings?.story_body}
              rows={7}
              required
            />
          </label>
        </div>
      </div>

      <div className={adminStyles.formFooter}>
        <label className={adminStyles.publishToggle}>
          <input
            className={adminStyles.publishCheckbox}
            name="is_published"
            type="checkbox"
            defaultChecked={settings?.is_published ?? false}
          />
          <span>Publish these details on the public website</span>
        </label>
        {state.error ? (
          <p className={adminStyles.formError}>{state.error}</p>
        ) : null}
        <button
          className={adminStyles.primaryButton}
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Save wedding details"}
        </button>
      </div>
    </form>
  );
}
