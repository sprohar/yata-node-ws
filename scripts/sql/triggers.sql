CREATE OR REPLACE FUNCTION create_default_user_projects()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
$$
BEGIN
	INSERT INTO public.project(name, user_id)
		 VALUES ('Inbox', NEW.id), ('Work', NEW.id), ('Personal', NEW.id), ('Shopping List', NEW.id);

	RETURN NEW;
END;
$$
;

CREATE TRIGGER init_new_user_projects
  AFTER INSERT
  ON public.user
  FOR EACH ROW
  EXECUTE PROCEDURE create_default_user_projects();
