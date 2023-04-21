CREATE OR REPLACE FUNCTION create_default_user_projects()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
$$
BEGIN
	INSERT INTO public.project(name, user_id)
		 VALUES ('Inbox', NEW.user_id), 
            ('Work', NEW.user_id), 
            ('Personal', NEW.user_id), 
            ('Shopping List', NEW.user_id);

	RETURN NEW;
END;
$$
;

DROP TRIGGER IF EXISTS create_default_projects ON public.users;

CREATE TRIGGER create_default_projects 
  AFTER INSERT
  ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE create_default_user_projects();
