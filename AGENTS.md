<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Store gallery entries in the shared database and uploads in Cloud storage; enforce editing permissions with database roles and storage policies, never with client-side UI state alone.
- Read gallery entries and create media links only through server functions after the shared password gate, so private content is not sent to locked visitors.
