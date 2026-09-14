export const adminStyles = {
  page: "min-h-screen bg-wedding-cream text-wedding-navy",
  authPage:
    "grid min-h-svh place-items-center bg-[radial-gradient(circle_at_15%_15%,rgb(102_152_211/24%),transparent_26rem),var(--wedding-cream)] p-5 text-wedding-navy",
  authPanel:
    "w-[min(100%,31rem)] border border-wedding-navy/16 bg-wedding-cream/82 p-[clamp(2rem,8vw,4.5rem)] shadow-[1rem_1rem_0_rgb(66_28_15/10%)]",
  mark: "wedding-display mt-0 mb-14 text-5xl leading-none text-wedding-brown",
  eyebrow:
    "m-0 text-[0.68rem] font-extrabold tracking-[0.14em] text-wedding-brown uppercase",
  authHeading:
    "wedding-display mt-3 mb-4 text-[clamp(3rem,12vw,5rem)] leading-[0.9] font-medium tracking-[-0.04em]",
  authIntro:
    "mt-0 mb-10 max-w-[25rem] text-[0.88rem] leading-[1.7] text-wedding-navy/72",
  loginForm: "grid gap-5",
  fieldLabel: "grid gap-[0.55rem]",
  fieldLabelText:
    "text-[0.68rem] font-extrabold tracking-[0.08em] text-wedding-brown uppercase",
  loginInput:
    "w-full rounded-none border border-wedding-navy/28 bg-wedding-cream/50 px-[0.9rem] py-[0.85rem] focus:border-wedding-navy focus:outline-2 focus:outline-offset-2 focus:outline-wedding-blue",
  formError: "m-0 min-h-5 text-[0.78rem] leading-normal text-status-error",
  primaryButton:
    "cursor-pointer rounded-none border border-wedding-navy bg-wedding-navy px-4 py-[0.95rem] text-[0.72rem] font-extrabold tracking-[0.08em] text-wedding-cream uppercase transition-colors duration-180 hover:not-disabled:bg-wedding-brown focus-visible:bg-wedding-brown disabled:cursor-wait disabled:opacity-60",
  setupNotice:
    "grid gap-2 border-l-[3px] border-wedding-blue bg-wedding-navy/7 px-4 py-[0.9rem] text-[0.78rem] leading-[1.6] [&_strong]:text-wedding-brown",
  backLink:
    "mt-8 inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.06em] text-wedding-brown no-underline uppercase hover:text-wedding-navy hover:underline hover:underline-offset-4",
  header:
    "flex min-w-0 items-center justify-between gap-2 border-b border-wedding-navy/14 px-4 py-3 phone:gap-4 phone:px-5 phone:py-4 md:px-8",
  brand: "inline-flex shrink-0 flex-col text-inherit no-underline",
  brandMonogram: "wedding-display text-[1.7rem] leading-[0.9]",
  brandLabel:
    "mt-[0.35rem] text-[0.58rem] font-extrabold tracking-[0.15em] text-wedding-brown uppercase",
  headerActions:
    "flex min-w-0 flex-1 items-center justify-end gap-2 phone:gap-4",
  user: "min-w-0 flex-1 max-w-60 overflow-hidden text-right text-[0.72rem] text-ellipsis whitespace-nowrap text-wedding-navy/64",
  logoutButton:
    "shrink-0 cursor-pointer rounded-none border border-wedding-navy bg-transparent px-[0.8rem] py-[0.65rem] text-[0.72rem] font-extrabold tracking-[0.08em] text-wedding-navy uppercase transition-colors duration-180 hover:bg-wedding-navy hover:text-wedding-cream focus-visible:bg-wedding-navy focus-visible:text-wedding-cream",
  shell: "grid min-w-0 min-h-[calc(100vh-5.1rem)] md:grid-cols-[15rem_1fr]",
  sidebar:
    "flex min-w-0 max-w-full flex-col gap-4 border-b border-wedding-navy/14 px-4 py-4 phone:p-5 md:sticky md:top-0 md:h-[calc(100vh-5.1rem)] md:self-start md:overflow-y-auto md:border-r md:border-b-0 md:px-5 md:py-8",
  sidebarNav:
    "flex min-w-0 max-w-full gap-1 overflow-x-auto overscroll-x-contain scrollbar-hide phone:gap-2 md:grid md:overflow-visible",
  navLink:
    "shrink-0 whitespace-nowrap px-[0.6rem] py-[0.55rem] text-[0.68rem] font-extrabold tracking-[0.06em] text-wedding-brown no-underline uppercase phone:px-[0.7rem]",
  navActive: "bg-wedding-navy text-wedding-cream",
  navDisabled: "cursor-not-allowed opacity-45",
  returnLink:
    "mt-auto inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.06em] text-wedding-brown no-underline uppercase hover:text-wedding-navy hover:underline hover:underline-offset-4",
  content:
    "w-[min(100%,76rem)] min-w-0 px-5 py-[clamp(2.5rem,7vw,6rem)] md:px-[clamp(2rem,7vw,7rem)]",
  formContent: "min-w-0 max-w-[78rem]",
  contentIntro: "max-w-[45rem]",
  contentHeading:
    "wedding-display mt-4 mb-6 text-[clamp(3.5rem,11vw,7.5rem)] leading-[0.86] font-medium tracking-[-0.05em]",
  contentCopy:
    "m-0 max-w-[32rem] text-[0.9rem] leading-[1.75] text-wedding-navy/68",
  moduleGrid: "mt-16 grid gap-4 md:grid-cols-3",
  moduleCard:
    "min-h-60 border border-wedding-navy/16 bg-wedding-cream/52 p-5 [&>p:last-child]:m-0 [&>p:last-child]:max-w-72 [&>p:last-child]:text-[0.8rem] [&>p:last-child]:leading-[1.6] [&>p:last-child]:text-wedding-navy/64 [&>svg]:mb-10 [&>svg]:text-wedding-blue",
  moduleHeading:
    "wedding-display mt-[0.55rem] mb-3 text-[2rem] leading-none font-medium text-wedding-brown",
  cardLink:
    "mt-5 inline-block text-[0.72rem] font-extrabold tracking-[0.05em] text-wedding-navy underline underline-offset-4 uppercase",
  honestyNote:
    "mt-8 mb-0 max-w-[35rem] text-[0.72rem] leading-[1.7] text-wedding-brown/78",
  pageError: "mt-12 max-w-[38rem]",
  saveConfirmation:
    "mt-10 -mb-4 inline-flex items-center gap-[0.45rem] text-[0.8rem] font-bold text-status-success",
  settingsForm:
    "mt-12 [&_label]:grid [&_label]:gap-[0.45rem] [&_label]:text-[0.68rem] [&_label]:font-extrabold [&_label]:tracking-[0.05em] [&_label]:text-wedding-brown [&_label]:uppercase [&_input]:w-full [&_input]:rounded-none [&_input]:border [&_input]:border-wedding-navy/18 [&_input]:bg-admin-field-surface/52 [&_input]:px-[0.85rem] [&_input]:py-[0.8rem] [&_input]:text-[0.85rem] [&_input]:font-medium [&_input]:tracking-normal [&_input]:text-wedding-navy [&_input]:normal-case [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-none [&_textarea]:border [&_textarea]:border-wedding-navy/18 [&_textarea]:bg-admin-field-surface/52 [&_textarea]:px-[0.85rem] [&_textarea]:py-[0.8rem] [&_textarea]:text-[0.85rem] [&_textarea]:font-medium [&_textarea]:tracking-normal [&_textarea]:text-wedding-navy [&_textarea]:normal-case [&_input:focus]:border-wedding-blue [&_input:focus]:outline-2 [&_input:focus]:outline-offset-1 [&_input:focus]:outline-admin-focus/28 [&_textarea:focus]:border-wedding-blue [&_textarea:focus]:outline-2 [&_textarea:focus]:outline-offset-1 [&_textarea:focus]:outline-admin-focus/28",
  formSection: "border-t border-wedding-navy/16 pt-6 pb-8",
  formGrid: "mt-4 grid gap-4 md:grid-cols-2",
  formGridWide: "max-w-[54rem]",
  fieldWide: "md:col-span-2",
  formFooter:
    "flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-wedding-navy/16 pt-6 pb-12",
  publishToggle:
    "flex! grid-cols-[auto_1fr] items-center gap-[0.6rem]! text-xs! tracking-normal! text-wedding-navy! normal-case!",
  publishCheckbox: "size-4! accent-wedding-navy",
  scheduleIntro: "flex flex-wrap items-end justify-between gap-6",
  scheduleList: "mt-12 grid gap-4",
  scheduleCard: "border border-wedding-navy/16 bg-wedding-cream/52 p-5 md:p-6",
  scheduleCardHeader: "flex items-start justify-between gap-4",
  scheduleNumber: "wedding-display text-3xl leading-none text-wedding-blue",
  scheduleControls: "flex items-center gap-2",
  iconButton:
    "inline-flex size-9 cursor-pointer items-center justify-center rounded-none border border-wedding-navy/22 bg-transparent text-wedding-navy transition-colors duration-180 hover:bg-wedding-navy hover:text-wedding-cream focus-visible:bg-wedding-navy focus-visible:text-wedding-cream disabled:cursor-not-allowed disabled:opacity-30",
  scheduleForm:
    "mt-6 grid gap-4 border-t border-wedding-navy/12 pt-5 [&_label]:grid [&_label]:gap-[0.45rem] [&_label]:text-[0.68rem] [&_label]:font-extrabold [&_label]:tracking-[0.05em] [&_label]:text-wedding-brown [&_label]:uppercase [&_input]:w-full [&_input]:rounded-none [&_input]:border [&_input]:border-wedding-navy/18 [&_input]:bg-admin-field-surface/52 [&_input]:px-[0.85rem] [&_input]:py-[0.8rem] [&_input]:text-[0.85rem] [&_input]:font-medium [&_input]:tracking-normal [&_input]:text-wedding-navy [&_input]:normal-case [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-none [&_textarea]:border [&_textarea]:border-wedding-navy/18 [&_textarea]:bg-admin-field-surface/52 [&_textarea]:px-[0.85rem] [&_textarea]:py-[0.8rem] [&_textarea]:text-[0.85rem] [&_textarea]:font-medium [&_textarea]:tracking-normal [&_textarea]:text-wedding-navy [&_textarea]:normal-case [&_input:focus]:border-wedding-blue [&_input:focus]:outline-2 [&_input:focus]:outline-offset-1 [&_input:focus]:outline-admin-focus/28 [&_textarea:focus]:border-wedding-blue [&_textarea:focus]:outline-2 [&_textarea:focus]:outline-offset-1 [&_textarea:focus]:outline-admin-focus/28",
  scheduleEmpty:
    "mt-12 border border-dashed border-wedding-navy/24 p-8 text-sm leading-7 text-wedding-navy/68",
  scheduleActions:
    "flex flex-wrap items-center justify-between gap-4 border-t border-wedding-navy/12 pt-4",
  pickerField: "relative min-w-0",
  pickerTrigger:
    "flex min-h-[2.75rem] w-full cursor-pointer items-center gap-2 rounded-none border border-wedding-navy/18 bg-admin-field-surface/52 px-[0.85rem] py-[0.8rem] text-left text-[0.85rem] font-medium normal-case text-wedding-navy transition-colors hover:border-wedding-blue focus-visible:border-wedding-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-admin-focus/28",
  pickerTriggerPlaceholder: "text-wedding-navy/48",
  pickerChevron: "ml-auto shrink-0 text-wedding-navy/54",
  datePopover:
    "absolute top-full left-0 z-50 mt-2 w-[min(21rem,calc(100vw-2.5rem))] overflow-hidden border border-wedding-navy/18 bg-wedding-cream p-4 text-wedding-navy shadow-[0.7rem_0.7rem_0_rgb(66_28_15/10%)]",
  timePopover:
    "absolute top-full left-0 z-50 mt-2 max-h-64 w-full min-w-44 overflow-y-auto border border-wedding-navy/18 bg-wedding-cream p-1 shadow-[0.7rem_0.7rem_0_rgb(66_28_15/10%)]",
  dateHeader: "flex items-center justify-between gap-2",
  dateHeadingControls: "flex min-w-0 items-center justify-center gap-1",
  dateMonthLabel:
    "wedding-display truncate text-lg font-medium text-wedding-brown",
  dateYearSelect:
    "cursor-pointer border-0 bg-transparent px-1 py-1 text-sm font-bold text-wedding-brown outline-none focus-visible:outline-2 focus-visible:outline-wedding-blue",
  pickerIconButton:
    "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-none border border-transparent text-wedding-navy transition-colors hover:border-wedding-navy/18 hover:bg-wedding-paper focus-visible:border-wedding-blue focus-visible:outline-2 focus-visible:outline-wedding-blue",
  dateWeekdays:
    "mt-4 grid grid-cols-7 text-center text-[0.62rem] font-extrabold tracking-[0.08em] text-wedding-brown uppercase",
  dateGrid: "mt-2 grid grid-cols-7 gap-1",
  dateDay:
    "aspect-square cursor-pointer rounded-full border border-transparent text-sm text-wedding-navy transition-colors hover:bg-wedding-paper focus-visible:border-wedding-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-wedding-blue",
  dateDaySelected:
    "bg-wedding-navy font-bold !text-wedding-cream hover:bg-wedding-brown",
  dateDayToday: "border-wedding-blue font-bold text-wedding-brown",
  pickerFooter:
    "mt-4 grid grid-cols-2 gap-3 border-t border-wedding-navy/14 pt-4",
  pickerCancel:
    "cursor-pointer border border-wedding-navy/20 bg-transparent px-3 py-2 text-[0.68rem] font-extrabold tracking-[0.06em] text-wedding-navy uppercase transition-colors hover:bg-wedding-paper focus-visible:outline-2 focus-visible:outline-wedding-blue",
  pickerApply:
    "cursor-pointer border border-wedding-navy bg-wedding-navy px-3 py-2 text-[0.68rem] font-extrabold tracking-[0.06em] text-wedding-cream uppercase transition-colors hover:bg-wedding-brown focus-visible:outline-2 focus-visible:outline-wedding-blue disabled:cursor-not-allowed disabled:opacity-45",
  timeOption:
    "block w-full cursor-pointer px-3 py-2 text-left text-sm text-wedding-navy transition-colors hover:bg-wedding-paper focus-visible:bg-wedding-paper focus-visible:outline-none",
  timeOptionSelected: "bg-wedding-navy/8 font-bold text-wedding-brown",
  dateTimeField: "grid gap-3 sm:grid-cols-2",
  dangerButton:
    "cursor-pointer border-0 bg-transparent p-0 text-xs font-extrabold tracking-[0.05em] text-status-error uppercase underline underline-offset-4",
  secondaryButton:
    "cursor-pointer rounded-none border border-wedding-navy/24 bg-transparent px-4 py-3 text-xs font-extrabold tracking-[0.06em] text-wedding-navy uppercase transition-colors duration-180 hover:bg-wedding-navy hover:text-wedding-cream focus-visible:bg-wedding-navy focus-visible:text-wedding-cream disabled:cursor-wait disabled:opacity-60",
} as const;
